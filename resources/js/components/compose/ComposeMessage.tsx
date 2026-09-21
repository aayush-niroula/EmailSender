import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import EmailEditor from '@/components/compose/Emaileditor';

type Props = {
    subject: string;
    body: string;
    scheduledAt: string;
    errors: Record<string, string[]>;
    onSubjectChange: (value: string) => void;
    onBodyChange: (value: string) => void;
    onScheduleChange: (value: string) => void;
    onClearSchedule: () => void;
};

export default function ComposeMessage({
    subject,
    body,
    scheduledAt,
    errors,
    onSubjectChange,
    onBodyChange,
    onScheduleChange,
    onClearSchedule,
}: Props) {
    return (
        <div className="px-5 py-6 sm:px-8">
            <Input
                value={subject}
                onChange={(event) => onSubjectChange(event.target.value)}
                placeholder="Subject"
                className="h-12 border-0 px-0 text-xl font-medium shadow-none focus-visible:ring-0"
            />
            {errors.subject && (
                <p className="text-destructive mt-1 text-xs">
                    {errors.subject.join(' ')}
                </p>
            )}
            <div className="mt-5">
                <EmailEditor
                    value={body}
                    onChange={onBodyChange}
                    placeholder="Start writing..."
                />
            </div>
            {errors.body && (
                <p className="text-destructive text-xs">
                    {errors.body.join(' ')}
                </p>
            )}
            <div className="mt-6 flex flex-wrap items-center gap-3 border-t pt-5">
                <Label
                    htmlFor="scheduled-at"
                    className="text-muted-foreground text-sm"
                >
                    Send later
                </Label>
                <Input
                    id="scheduled-at"
                    type="datetime-local"
                    value={scheduledAt}
                    min={new Date(Date.now() + 60_000)
                        .toISOString()
                        .slice(0, 16)}
                    onChange={(event) => onScheduleChange(event.target.value)}
                    className="w-auto"
                />
                {scheduledAt && (
                    <button
                        type="button"
                        onClick={onClearSchedule}
                        className="text-muted-foreground text-xs underline underline-offset-4"
                    >
                        Clear schedule
                    </button>
                )}
                {errors.scheduled_at && (
                    <p className="text-destructive basis-full text-xs">
                        {errors.scheduled_at.join(' ')}
                    </p>
                )}
            </div>
        </div>
    );
}
