import { Paperclip, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Props = {
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    sending: boolean;
    sent: boolean;
    onFilesChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function ComposeFooter({
    fileInputRef,
    sending,
    sent,
    onFilesChange,
}: Props) {
    return (
        <div className="bg-muted/60 flex flex-wrap items-center justify-between gap-3 border-t px-5 py-4 sm:px-8">
            <div>
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={onFilesChange}
                    className="hidden"
                />
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <Paperclip />
                    Attach files
                </Button>
            </div>
            <Button
                type="submit"
                disabled={sending}
                className="bg-orange-600 text-white hover:bg-orange-700"
            >
                {sending ? 'Sending...' : sent ? 'Sent' : 'Send email'}
                {!sending && !sent && <Send />}
            </Button>
        </div>
    );
}
