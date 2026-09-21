import { Paperclip, X } from "lucide-react";

type Props = {
    attachments: File[];
    onRemove: (fileName: string) => void;
};

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) {
        return `${Math.round(bytes / 1024)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AttachmentList({
    attachments,
    onRemove,
}: Props) {
    if (attachments.length === 0) {
        return null;
    }

    return (
        <div className="mx-5 mb-5 flex flex-wrap gap-2 sm:mx-8">
            {attachments.map((file) => (
                <div
                    key={file.name}
                    className="flex items-center gap-2 rounded-lg border px-3 py-2 text-xs"
                >
                    <Paperclip className="size-3.5 text-orange-600" />

                    <span className="max-w-48 truncate">
                        {file.name}
                    </span>

                    <span className="text-muted-foreground">
                        {formatBytes(file.size)}
                    </span>

                    <button
                        type="button"
                        onClick={() => onRemove(file.name)}
                    >
                        <X className="text-muted-foreground size-3.5" />
                    </button>
                </div>
            ))}
        </div>
    );
}