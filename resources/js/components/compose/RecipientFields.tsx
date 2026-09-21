import { X } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { AddressField } from '@/utils/email';

import RecipientGroupSelector, {
    type RecipientGroup,
    type Recipient,
} from './RecipientGroupSelector';

type Props = {
    addresses: Record<AddressField, string[]>;
    addressInput: Record<AddressField, string>;
    selectedRecipients: Recipient[];

    recipientGroups: RecipientGroup[];
    selectedGroups: RecipientGroup[];
    loadingGroups: boolean;
    showGroupSelector: boolean;

    onInputChange: (field: AddressField, value: string) => void;

    onToggleRecipient: (recipient: Recipient) => void;

    onAddAddress: (field: AddressField) => void;

    onKeyDown: (
        event: React.KeyboardEvent<HTMLInputElement>,
        field: AddressField,
    ) => void;

    onRemoveAddress: (field: AddressField, address: string) => void;

    onToggleGroup: (group: RecipientGroup, recipients: Recipient[]) => void;
    onToggleGroupSelector: () => void;
    onRemoveGroup: (groupId: number) => void;

    errors: Record<string, string[]>;
};

export default function RecipientFields({
    addresses,
    addressInput,
    selectedRecipients,
    onToggleRecipient,
    recipientGroups,
    selectedGroups,
    loadingGroups,
    showGroupSelector,
    onInputChange,
    onAddAddress,
    onKeyDown,
    onRemoveAddress,
    onToggleGroup,
    onToggleGroupSelector,
    onRemoveGroup,
    errors,
}: Props) {
    return (
        <div className="border-b px-5 py-4 sm:px-8">
            {/* Recipient groups */}
            <div className="mb-4">
                <RecipientGroupSelector
                    groups={recipientGroups}
                    selectedRecipients={selectedRecipients}
                    loading={loadingGroups}
                    open={showGroupSelector}
                    onToggleOpen={onToggleGroupSelector}
                    onToggleGroup={onToggleGroup}
                    onToggleRecipient={onToggleRecipient}
                />
            </div>

            {/* Selected groups */}
            {selectedGroups.length > 0 && (
                <div className="mb-4">
                    <div className="mb-2 flex flex-wrap gap-2">
                        {selectedGroups.map((group) => (
                            <span
                                key={group.id}
                                className="bg-secondary inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium"
                            >
                                {group.name}

                                <button
                                    type="button"
                                    onClick={() => onRemoveGroup(group.id)}
                                    className="hover:text-destructive"
                                    aria-label={`Remove ${group.name}`}
                                >
                                    <X className="size-3" />
                                </button>
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* To / CC / BCC */}
            {(['to', 'cc', 'bcc'] as AddressField[]).map((field) => (
                <div
                    key={field}
                    className="flex min-h-12 items-center gap-4 border-b last:border-0"
                >
                    <Label
                        className="text-muted-foreground w-12 shrink-0 text-sm capitalize"
                        htmlFor={`${field}-input`}
                    >
                        {field}
                    </Label>

                    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 py-2">
                        {addresses[field].map((address) => (
                            <span
                                key={address}
                                className="bg-secondary inline-flex max-w-full items-center gap-1 rounded-full px-3 py-1 text-xs font-medium"
                            >
                                <span className="truncate">{address}</span>

                                <button
                                    type="button"
                                    onClick={() =>
                                        onRemoveAddress(field, address)
                                    }
                                    className="hover:text-destructive"
                                    aria-label={`Remove ${address}`}
                                >
                                    <X className="size-3" />
                                </button>
                            </span>
                        ))}

                        {field === 'to' &&
                            selectedRecipients.map((recipient) => (
                                <span
                                    key={`recipient-${recipient.id}`}
                                    className="bg-primary/10 text-primary inline-flex max-w-full items-center gap-1 rounded-full px-3 py-1 text-xs font-medium"
                                >
                                    <span className="truncate">
                                        {recipient.email}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            onToggleRecipient(recipient)
                                        }
                                        className="hover:text-destructive"
                                        aria-label={`Remove ${recipient.email}`}
                                    >
                                        <X className="size-3" />
                                    </button>
                                </span>
                            ))}

                        <Input
                            id={`${field}-input`}
                            value={addressInput[field]}
                            onChange={(event) =>
                                onInputChange(field, event.target.value)
                            }
                            onBlur={() => onAddAddress(field)}
                            onKeyDown={(event) => onKeyDown(event, field)}
                            placeholder={
                                field === 'to' ? 'name@example.com' : 'Optional'
                            }
                            className="h-8 min-w-45 flex-1 border-0 px-0 shadow-none focus-visible:ring-0"
                        />
                    </div>
                </div>
            ))}

            {/* Validation errors */}
            {errors.to && (
                <p className="text-destructive mt-2 text-xs">
                    {errors.to.join(' ')}
                </p>
            )}

            {errors.cc && (
                <p className="text-destructive mt-2 text-xs">
                    {errors.cc.join(' ')}
                </p>
            )}

            {errors.bcc && (
                <p className="text-destructive mt-2 text-xs">
                    {errors.bcc.join(' ')}
                </p>
            )}
        </div>
    );
}
