import { Head } from '@inertiajs/react';
import { Paperclip, PenLine, Send, X } from 'lucide-react';
import { FormEvent, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type AddressField = 'to' | 'cc' | 'bcc';
type FormErrors = Record<string, string[]>;

const emptyAddresses: Record<AddressField, string[]> = { to: [], cc: [], bcc: [] };

function parseAddresses(value: string): string[] {
    return value.split(/[\s,;]+/).map((address) => address.trim()).filter(Boolean);
}

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function compressImage(file: File): Promise<File> {
    if (!file.type.startsWith('image/') || file.size <= 1024 * 1024) {
        return file;
    }

    try {
        const image = await decodeImage(file);
        const scale = Math.min(1, 2000 / Math.max(image.width, image.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        canvas.getContext('2d')?.drawImage(image, 0, 0, canvas.width, canvas.height);

        const blob = await canvasToBlob(canvas, 0.75);
        const compressedBlob = blob && blob.size < file.size ? blob : await canvasToBlob(canvas, 0.55);

        if (!compressedBlob || compressedBlob.size >= file.size) {
            return file;
        }

        return new File([compressedBlob], file.name.replace(/\.[^.]+$/, '.jpg'), {
            type: 'image/jpeg',
            lastModified: file.lastModified,
        });
    } catch {
        return file;
    }
}

async function decodeImage(file: File): Promise<ImageBitmap | HTMLImageElement> {
    if (typeof createImageBitmap === 'function') {
        return createImageBitmap(file);
    }

    return new Promise((resolve, reject) => {
        const image = new Image();
        const url = URL.createObjectURL(file);
        image.onload = () => {
            URL.revokeObjectURL(url);
            resolve(image);
        };
        image.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Unable to decode image'));
        };
        image.src = url;
    });
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> {
    return new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
}

export default function Compose() {
    const [addresses, setAddresses] = useState(emptyAddresses);
    const [addressInput, setAddressInput] = useState<Record<AddressField, string>>({ to: '', cc: '', bcc: '' });
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [scheduledAt, setScheduledAt] = useState('');
    const [attachments, setAttachments] = useState<File[]>([]);
    const [errors, setErrors] = useState<FormErrors>({});
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    function addAddresses(field: AddressField, value = addressInput[field]) {
        const newAddresses = parseAddresses(value);
        if (newAddresses.length === 0) return;

        setAddresses((current) => ({ ...current, [field]: [...new Set([...current[field], ...newAddresses])] }));
        setAddressInput((current) => ({ ...current, [field]: '' }));
    }

    function removeAddress(field: AddressField, address: string) {
        setAddresses((current) => ({ ...current, [field]: current[field].filter((item) => item !== address) }));
    }

    function handleAddressKeyDown(event: React.KeyboardEvent<HTMLInputElement>, field: AddressField) {
        if (event.key === 'Enter' || event.key === ',' || event.key === ' ') {
            event.preventDefault();
            addAddresses(field);
        }
    }

    function handleFiles(event: React.ChangeEvent<HTMLInputElement>) {
        const selectedFiles = Array.from(event.target.files ?? []);
        setAttachments((current) => [
            ...current,
            ...selectedFiles.filter((file) => !current.some((currentFile) => currentFile.name === file.name)),
        ]);
        event.target.value = '';
    }

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        addAddresses('to');
        addAddresses('cc');
        addAddresses('bcc');
        setSending(true);
        setSent(false);
        setErrors({});

        const formData = new FormData();
        [...addresses.to, ...parseAddresses(addressInput.to)].forEach((address) => formData.append('to[]', address));
        [...addresses.cc, ...parseAddresses(addressInput.cc)].forEach((address) => formData.append('cc[]', address));
        [...addresses.bcc, ...parseAddresses(addressInput.bcc)].forEach((address) => formData.append('bcc[]', address));
        formData.append('subject', subject);
        formData.append('body', body);
        if (scheduledAt) {
            formData.append('scheduled_at', new Date(scheduledAt).toISOString());
        }
        const filesToUpload = await Promise.all(attachments.map(compressImage));
        filesToUpload.forEach((file) => formData.append('attachments[]', file));

        try {
            const response = await fetch('/api/emails', {
                method: 'POST',
                body: formData,
                headers: { Accept: 'application/json' },
            });

            if (!response.ok) {
                const result = await response.json().catch(() => ({}));
                setErrors(result.errors ?? { form: ['Unable to send this email.'] });
                return;
            }

            setSent(true);
            setAddresses(emptyAddresses);
            setAddressInput({ to: '', cc: '', bcc: '' });
            setSubject('');
            setBody('');
            setScheduledAt('');
            setAttachments([]);
        } catch {
            setErrors({ form: ['The email service could not be reached.'] });
        } finally {
            setSending(false);
        }
    }

    return (
        <>
            <Head title="Compose email" />
            <main className="min-h-[calc(100vh-4rem)] bg-stone-50/70 px-4 py-8 dark:bg-stone-950/30 sm:px-8">
                <div className="mx-auto max-w-5xl">
                    <div className="mb-8 flex items-end justify-between gap-4">
                        <div>
                            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-orange-600 dark:text-orange-400">Outbox</p>
                            <h1 className="text-3xl font-semibold tracking-tight">Compose email</h1>
                            <p className="mt-2 text-sm text-muted-foreground">Write something worth opening.</p>
                        </div>
                        <div className="hidden size-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-700 sm:flex dark:bg-orange-950/50 dark:text-orange-300"><PenLine className="size-5" /></div>
                    </div>

                    <form onSubmit={submit} className="overflow-hidden rounded-2xl border bg-background shadow-sm">
                        <div className="border-b px-5 py-4 sm:px-8">
                            {(['to', 'cc', 'bcc'] as AddressField[]).map((field) => (
                                <div key={field} className="flex min-h-12 items-center gap-4 border-b last:border-0">
                                    <Label className="w-12 shrink-0 text-sm capitalize text-muted-foreground" htmlFor={`${field}-input`}>{field}</Label>
                                    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 py-2">
                                        {addresses[field].map((address) => (
                                            <span key={address} className="inline-flex max-w-full items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-900 dark:bg-orange-950/60 dark:text-orange-200">
                                                <span className="truncate">{address}</span>
                                                <button type="button" onClick={() => removeAddress(field, address)} aria-label={`Remove ${address}`} className="rounded-full p-0.5 hover:bg-orange-200 dark:hover:bg-orange-900"><X className="size-3" /></button>
                                            </span>
                                        ))}
                                        <Input id={`${field}-input`} value={addressInput[field]} onChange={(event) => setAddressInput((current) => ({ ...current, [field]: event.target.value }))} onBlur={() => addAddresses(field)} onKeyDown={(event) => handleAddressKeyDown(event, field)} placeholder={field === 'to' ? 'name@example.com' : 'Optional'} className="h-8 min-w-45 flex-1 border-0 px-0 shadow-none focus-visible:ring-0" type="text" />
                                    </div>
                                </div>
                            ))}
                            {errors.to && <p className="mt-2 text-xs text-destructive">{errors.to.join(' ')}</p>}
                        </div>

                        <div className="px-5 py-6 sm:px-8">
                            <Input value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="Subject" className="h-12 border-0 px-0 text-xl font-medium shadow-none focus-visible:ring-0" />
                            {errors.subject && <p className="mt-1 text-xs text-destructive">{errors.subject.join(' ')}</p>}
                            <textarea value={body} onChange={(event) => setBody(event.target.value)} placeholder="Start writing..." className="mt-5 min-h-72 w-full resize-y border-0 bg-transparent text-[15px] leading-7 outline-none placeholder:text-muted-foreground focus:ring-0" />
                            {errors.body && <p className="text-xs text-destructive">{errors.body.join(' ')}</p>}
                            <div className="mt-6 flex flex-wrap items-center gap-3 border-t pt-5">
                                <Label htmlFor="scheduled-at" className="text-sm text-muted-foreground">Send later</Label>
                                <Input
                                    id="scheduled-at"
                                    type="datetime-local"
                                    value={scheduledAt}
                                    min={new Date(Date.now() + 60_000).toISOString().slice(0, 16)}
                                    onChange={(event) => setScheduledAt(event.target.value)}
                                    className="w-auto"
                                />
                                {scheduledAt && <button type="button" onClick={() => setScheduledAt('')} className="text-xs text-muted-foreground underline underline-offset-4">Clear schedule</button>}
                                {errors.scheduled_at && <p className="basis-full text-xs text-destructive">{errors.scheduled_at.join(' ')}</p>}
                            </div>
                        </div>

                        {attachments.length > 0 && <div className="mx-5 mb-5 flex flex-wrap gap-2 sm:mx-8">{attachments.map((file) => <div key={file.name} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-xs"><Paperclip className="size-3.5 text-orange-600" /><span className="max-w-48 truncate">{file.name}</span><span className="text-muted-foreground">{formatBytes(file.size)}</span><button type="button" onClick={() => setAttachments((current) => current.filter((item) => item.name !== file.name))} aria-label={`Remove ${file.name}`}><X className="size-3.5 text-muted-foreground" /></button></div>)}</div>}

                        <div className="flex flex-wrap items-center justify-between gap-3 border-t bg-stone-50/70 px-5 py-4 sm:px-8 dark:bg-stone-950/30">
                            <div><input ref={fileInputRef} type="file" multiple onChange={handleFiles} className="hidden" /><Button type="button" variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()}><Paperclip />Attach files</Button></div>
                            <Button type="submit" disabled={sending} className="bg-orange-600 text-white hover:bg-orange-700">{sending ? 'Sending...' : sent ? 'Sent' : 'Send email'}{!sending && !sent && <Send />}</Button>
                        </div>
                        {(errors.form || sent) && <div className={`border-t px-5 py-3 text-sm sm:px-8 ${sent ? 'text-emerald-700 dark:text-emerald-400' : 'text-destructive'}`}>{sent ? 'Your email was sent successfully.' : errors.form?.join(' ')}</div>}
                    </form>
                </div>
            </main>
        </>
    );
}

Compose.layout = { breadcrumbs: [{ title: 'Compose email', href: '/compose' }] };