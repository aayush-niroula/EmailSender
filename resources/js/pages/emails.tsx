import { Head, Link } from '@inertiajs/react';
import { Mail, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Email = {
    id: number;
    recipient: string[];
    subject: string;
    body: string;
    created_at: string;
    thread_id: string;
    delivery_status: 'queued' | 'sending' | 'sent' | 'failed';
    delivered_at: string | null;
    failure_reason: string | null;
};

type Props = {
    emails: Email[];
};

export default function Emails({ emails }: Props) {
    return (
        <>
            <Head title="Emails" />
            <main className="bg-background min-h-screen px-4 py-8 sm:px-8">
                <div className="mx-auto max-w-4xl">
                    <div className="mb-8 flex items-center justify-between gap-4">
                        <div>
                            <p className="text-primary mb-2 text-xs font-semibold tracking-[0.2em] uppercase">
                                Mailbox
                            </p>
                            <h1 className="text-3xl font-semibold tracking-tight">
                                Emails
                            </h1>
                        </div>
                        <Button asChild>
                            <Link href="/compose">
                                <Plus />
                                Compose
                            </Link>
                        </Button>
                    </div>

                    <div className="bg-background overflow-hidden rounded-2xl border shadow-sm">
                        {emails.length === 0 ? (
                            <div className="text-muted-foreground flex flex-col items-center gap-3 px-6 py-16 text-center">
                                <Mail className="size-8" />
                                <p>No emails yet.</p>
                            </div>
                        ) : (
                            <div className="divide-y">
                                {emails.map((email) => (
                                    <Link
                                        key={email.id}
                                        href={`/emails/${email.id}`}
                                        className="hover:bg-muted/70 block px-5 py-4 transition-colors sm:px-8"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="min-w-0">
                                                <p className="truncate font-medium">
                                                    {email.subject}
                                                </p>
                                                <p className="text-muted-foreground mt-1 truncate text-sm">
                                                    To:{' '}
                                                    {email.recipient.join(', ')}
                                                </p>
                                                <p className="text-muted-foreground mt-2 line-clamp-2 text-sm">
                                                    {email.body}
                                                </p>
                                            </div>
                                            <time className="text-muted-foreground shrink-0 text-xs">
                                                {new Date(
                                                    email.created_at,
                                                ).toLocaleString()}
                                            </time>
                                        </div>
                                        <div className="mt-3 flex items-center gap-2">
                                            <span
                                                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                                    email.delivery_status === 'sent' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300' : email.delivery_status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300' }`}   >
                                                {email.delivery_status ==='sent' ? 'Delivered' : email.delivery_status ===    'failed'   ? 'Failed': email.delivery_status === 'sending'  ? 'Sending': 'Queued'}
                                            </span>
                                            {email.failure_reason && (
                                                <span className="text-xs text-red-700 dark:text-red-300"> {email.failure_reason}  </span>  )}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </>
    );
}
