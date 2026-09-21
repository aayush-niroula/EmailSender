import { Check, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export type RecipientGroup = {
    id: number;
    name: string;
    slug: string;
    recipients_count: number;
};

export type Recipient = {
    id: number;
    recipient_group_id: number;
    name: string;
    email: string;
};

type Props = {
    groups: RecipientGroup[];
    selectedRecipients: Recipient[];
    loading: boolean;
    open: boolean;

    onToggleOpen: () => void;

    onToggleGroup: (group: RecipientGroup, recipients: Recipient[]) => void;

    onToggleRecipient: (recipient: Recipient) => void;
};

export default function RecipientGroupSelector({
    groups,
    selectedRecipients,
    loading,
    open,
    onToggleOpen,
    onToggleGroup,
    onToggleRecipient,
}: Props) {
    const [expandedGroups, setExpandedGroups] = useState<number[]>([]);
    const [groupRecipients, setGroupRecipients] = useState<
        Record<number, Recipient[]>
    >({});

    const [loadingRecipients, setLoadingRecipients] = useState<number | null>(
        null,
    );

    const toggleExpand = async (group: RecipientGroup) => {
        const isExpanded = expandedGroups.includes(group.id);

        if (isExpanded) {
            setExpandedGroups((current) =>
                current.filter((id) => id !== group.id),
            );
            return;
        }

        setExpandedGroups((current) => [...current, group.id]);

        if (groupRecipients[group.id]) {
            return;
        }

        try {
            setLoadingRecipients(group.id);

            const response = await fetch(
                `/api/recipient-groups/${group.id}/recipients`,
            );

            if (!response.ok) {
                throw new Error('Failed to load recipients');
            }

            const data: Recipient[] = await response.json();

            setGroupRecipients((current) => ({
                ...current,
                [group.id]: data,
            }));
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingRecipients(null);
        }
    };

    const isRecipientSelected = (recipient: Recipient) => {
        return selectedRecipients.some((item) => item.id === recipient.id);
    };

    const areAllRecipientsSelected = (group: RecipientGroup) => {
        const recipients = groupRecipients[group.id] ?? [];

        if (recipients.length === 0) {
            return false;
        }

        return recipients.every((recipient) => isRecipientSelected(recipient));
    };

    const handleGroupSelect = async (group: RecipientGroup) => {
        let recipients = groupRecipients[group.id];

        if (!recipients) {
            try {
                setLoadingRecipients(group.id);

                const response = await fetch(
                    `/api/recipient-groups/${group.id}/recipients`,
                );

                if (!response.ok) {
                    throw new Error('Failed to load recipients');
                }

                recipients = await response.json();

                setGroupRecipients((current) => ({
                    ...current,
                    [group.id]: recipients!,
                }));
            } catch (error) {
                console.error(error);
                return;
            } finally {
                setLoadingRecipients(null);
            }
        }

        onToggleGroup(group, recipients);
    };

    return (
        <div className="relative">
            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onToggleOpen}
            >
                Select recipients
                <ChevronDown className="ml-2 size-4" />
            </Button>

            {open && (
                <div className="bg-background absolute z-50 mt-2 w-full max-w-lg rounded-lg border p-3 shadow-lg">
                    <p className="mb-3 text-sm font-medium">
                        Select recipients
                    </p>

                    {loading ? (
                        <p className="text-muted-foreground text-sm">
                            Loading groups...
                        </p>
                    ) : groups.length === 0 ? (
                        <p className="text-muted-foreground text-sm">
                            No recipient groups found.
                        </p>
                    ) : (
                        <div className="space-y-1">
                            {groups.map((group) => {
                                const expanded = expandedGroups.includes(
                                    group.id,
                                );

                                const allSelected =
                                    areAllRecipientsSelected(group);

                                const recipients =
                                    groupRecipients[group.id] ?? [];

                                return (
                                    <div key={group.id} className="rounded-md">
                                        {/* GROUP */}
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    toggleExpand(group)
                                                }
                                                className="hover:bg-muted rounded p-1"
                                            >
                                                {expanded ? (
                                                    <ChevronDown className="size-4" />
                                                ) : (
                                                    <ChevronRight className="size-4" />
                                                )}
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleGroupSelect(group)
                                                }
                                                aria-pressed={allSelected}
                                                className={`hover:bg-muted focus-visible:ring-ring flex min-h-11 flex-1 cursor-pointer items-center justify-between rounded-md px-3 py-2 text-left transition-colors focus-visible:ring-2 focus-visible:outline-none ${
                                                    allSelected
                                                        ? 'bg-muted'
                                                        : ''
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="flex size-4 items-center justify-center rounded border">
                                                        {allSelected && (
                                                            <Check className="size-3" />
                                                        )}
                                                    </div>

                                                    <span className="text-sm font-medium">
                                                        {group.name}
                                                    </span>
                                                </div>

                                                <span className="text-muted-foreground text-xs">
                                                    {group.recipients_count}
                                                </span>
                                            </button>
                                        </div>

                                        {/* RECIPIENTS */}
                                        {expanded && (
                                            <div className="mt-1 ml-8 space-y-1 border-l pl-3">
                                                {loadingRecipients ===
                                                group.id ? (
                                                    <p className="text-muted-foreground px-2 py-2 text-xs">
                                                        Loading recipients...
                                                    </p>
                                                ) : recipients.length === 0 ? (
                                                    <p className="text-muted-foreground px-2 py-2 text-xs">
                                                        No recipients found.
                                                    </p>
                                                ) : (
                                                    recipients.map(
                                                        (recipient) => {
                                                            const selected =
                                                                isRecipientSelected(
                                                                    recipient,
                                                                );

                                                            return (
                                                                <button
                                                                    key={
                                                                        recipient.id
                                                                    }
                                                                    type="button"
                                                                    onClick={() =>
                                                                        onToggleRecipient(
                                                                            recipient,
                                                                        )
                                                                    }
                                                                    aria-pressed={
                                                                        selected
                                                                    }
                                                                    className={`hover:bg-muted focus-visible:ring-ring flex min-h-12 w-full cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-left transition-colors focus-visible:ring-2 focus-visible:outline-none ${
                                                                        selected
                                                                            ? 'bg-primary/10'
                                                                            : ''
                                                                    }`}
                                                                >
                                                                    <div
                                                                        className={`flex size-5 shrink-0 items-center justify-center rounded border ${
                                                                            selected
                                                                                ? 'border-primary bg-primary text-primary-foreground'
                                                                                : 'bg-background'
                                                                        }`}
                                                                    >
                                                                        {selected && (
                                                                            <Check className="size-3" />
                                                                        )}
                                                                    </div>

                                                                    <div className="min-w-0">
                                                                        <p className="truncate text-sm">
                                                                            {
                                                                                recipient.name
                                                                            }
                                                                        </p>

                                                                        <p className="text-muted-foreground truncate text-xs">
                                                                            {
                                                                                recipient.email
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                </button>
                                                            );
                                                        },
                                                    )
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
