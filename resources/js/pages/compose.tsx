import { Head } from "@inertiajs/react";
import { PenLine } from "lucide-react";
import {
    FormEvent,
    useEffect,
    useRef,
    useState,
} from "react";

import AttachmentList from "@/components/compose/AttachmentList";
import ComposeFooter from "@/components/compose/ComposeFooter";
import ComposeMessage from "@/components/compose/ComposeMessage";
import RecipientFields from "@/components/compose/RecipientFields";
import type { Recipient,RecipientGroup } from "@/components/compose/RecipientGroupSelector";

import {
    emptyAddresses,
    isValidEmail,
    parseAddresses,
    type AddressField,
    type FormErrors,
} from "@/utils/email";

import { compressImage } from "@/utils/image";




export default function Compose() {


    const [addresses, setAddresses] =
        useState(emptyAddresses);

    const [addressInput, setAddressInput] = useState<
        Record<AddressField, string>
    >({
        to: "",
        cc: "",
        bcc: "",
    });
    const [selectedRecipients, setSelectedRecipients] =
    useState<Recipient[]>([]);



    const [recipientGroups, setRecipientGroups] =
        useState<RecipientGroup[]>([]);

    const [selectedGroups, setSelectedGroups] =
        useState<RecipientGroup[]>([]);

    const [showGroupSelector, setShowGroupSelector] =
        useState(false);

    const [loadingGroups, setLoadingGroups] =
        useState(false);

 

    const [subject, setSubject] = useState("");
    const [body, setBody] = useState("");
    const [scheduledAt, setScheduledAt] = useState("");

    const [attachments, setAttachments] =
        useState<File[]>([]);


    const [errors, setErrors] =
        useState<FormErrors>({});

    const [sending, setSending] =
        useState(false);

    const [sent, setSent] =
        useState(false);

    const fileInputRef =
        useRef<HTMLInputElement>(null);


    useEffect(() => {
        async function loadRecipientGroups() {
            setLoadingGroups(true);

            try {
                const response = await fetch(
                    "/api/recipient-groups",
                    {
                        headers: {
                            Accept: "application/json",
                        },
                    },
                );

                if (!response.ok) {
                    throw new Error(
                        "Unable to load recipient groups",
                    );
                }

                const data: RecipientGroup[] =
                    await response.json();

                setRecipientGroups(data);
            } catch {
                setErrors((current) => ({
                    ...current,
                    form: [
                        "Unable to load recipient groups.",
                    ],
                }));
            } finally {
                setLoadingGroups(false);
            }
        }

        loadRecipientGroups();
    }, []);
       


    const toggleRecipient = (recipient: Recipient) => {
    setSelectedRecipients((current) => {
        const exists = current.some(
            (item) => item.id === recipient.id,
        );

        if (exists) {
            return current.filter(
                (item) => item.id !== recipient.id,
            );
        }

        return [...current, recipient];
    });
};


    function handleInputChange(
        field: AddressField,
        value: string,
    ) {
        setAddressInput((current) => ({
            ...current,
            [field]: value,
        }));
    }


    function addAddresses(
        field: AddressField,
        value = addressInput[field],
    ) {
        const newAddresses = parseAddresses(value);

        if (newAddresses.length === 0) {
            return;
        }

        const invalidAddresses = newAddresses.filter(
            (address) => !isValidEmail(address),
        );

        if (invalidAddresses.length > 0) {
            setErrors((current) => ({
                ...current,
                [field]: [
                    `Invalid email address: ${invalidAddresses.join(", ")}`,
                ],
            }));

            return;
        }

        setAddresses((current) => ({
            ...current,
            [field]: [
                ...new Set([
                    ...current[field],
                    ...newAddresses,
                ]),
            ],
        }));

        setAddressInput((current) => ({
            ...current,
            [field]: "",
        }));

        setErrors((current) => {
            const updated = { ...current };

            delete updated[field];

            return updated;
        });
    }



    function removeAddress(
        field: AddressField,
        address: string,
    ) {
        setAddresses((current) => ({
            ...current,
            [field]: current[field].filter(
                (item) => item !== address,
            ),
        }));
    }



    function handleAddressKeyDown(
        event: React.KeyboardEvent<HTMLInputElement>,
        field: AddressField,
    ) {
        if (
            event.key === "Enter" ||
            event.key === "," ||
            event.key === " "
        ) {
            event.preventDefault();

            addAddresses(field);
        }
    }



 const toggleGroup = (
    group: RecipientGroup,
    recipients: Recipient[],
) => {
    const selected = selectedGroups.some(
        (item) => item.id === group.id,
    );

    if (selected) {
        setSelectedGroups((current) =>
            current.filter(
                (item) => item.id !== group.id,
            ),
        );

        setSelectedRecipients((current) =>
            current.filter(
                (recipient) =>
                    recipient.recipient_group_id !==
                    group.id,
            ),
        );

        return;
    }

    setSelectedGroups((current) => [
        ...current,
        group,
    ]);

    setSelectedRecipients((current) => {
        const existingIds = new Set(
            current.map((item) => item.id),
        );

        const newRecipients = recipients.filter(
            (recipient) =>
                !existingIds.has(recipient.id),
        );

        return [...current, ...newRecipients];
    });
};
    function removeGroup(groupId: number) {
        setSelectedGroups((current) =>
            current.filter(
                (group) => group.id !== groupId,
            ),
        );

        setSelectedRecipients((current) =>
            current.filter(
                (recipient) => recipient.recipient_group_id !== groupId,
            ),
        );
    }

    function toggleGroupSelector() {
        setShowGroupSelector(
            (current) => !current,
        );
    }



    function handleFiles(
        event: React.ChangeEvent<HTMLInputElement>,
    ) {
        const selectedFiles = Array.from(
            event.target.files ?? [],
        );

        setAttachments((current) => [
            ...current,

            ...selectedFiles.filter(
                (file) =>
                    !current.some(
                        (currentFile) =>
                            currentFile.name ===
                            file.name,
                    ),
            ),
        ]);

        event.target.value = "";
    }

 

    async function submit(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        const selectedRecipientEmails = selectedRecipients.map((recipient)=>recipient.email)


        const finalTo =Array.from(new Set([...addresses.to,...parseAddresses(addressInput.to),...selectedRecipientEmails]))

        
        const finalCc = [
            ...addresses.cc,
            ...parseAddresses(addressInput.cc),
        ];

        const finalBcc = [
            ...addresses.bcc,
            ...parseAddresses(addressInput.bcc),
        ];

   

        const invalidTo = finalTo.filter(
            (address) => !isValidEmail(address),
        );

        const invalidCc = finalCc.filter(
            (address) => !isValidEmail(address),
        );

        const invalidBcc = finalBcc.filter(
            (address) => !isValidEmail(address),
        );

        if (
            invalidTo.length ||
            invalidCc.length ||
            invalidBcc.length
        ) {
            setErrors({
                ...(invalidTo.length
                    ? {
                          to: [
                              `Invalid email address: ${invalidTo.join(", ")}`,
                          ],
                      }
                    : {}),

                ...(invalidCc.length
                    ? {
                          cc: [
                              `Invalid email address: ${invalidCc.join(", ")}`,
                          ],
                      }
                    : {}),

                ...(invalidBcc.length
                    ? {
                          bcc: [
                              `Invalid email address: ${invalidBcc.join(", ")}`,
                          ],
                      }
                    : {}),
            });

            return;
        }

  

        const uniqueTo = [
            ...new Set(finalTo),
        ];

        const uniqueCc = [
            ...new Set(finalCc),
        ];

        const uniqueBcc = [
            ...new Set(finalBcc),
        ];

  

        if (
            uniqueTo.length === 0 &&
            selectedGroups.length === 0
        ) {
            setErrors({
                to: [
                    "Please enter at least one recipient or select a recipient group.",
                ],
            });

            return;
        }

        setSending(true);
        setSent(false);
        setErrors({});


        const formData = new FormData();

        uniqueTo.forEach((address) => {
            formData.append(
                "to[]",
                address,
            );
        });

        uniqueCc.forEach((address) => {
            formData.append(
                "cc[]",
                address,
            );
        });

        uniqueBcc.forEach((address) => {
            formData.append(
                "bcc[]",
                address,
            );
        });



        selectedGroups.forEach((group) => {
            formData.append(
                "recipient_groups[]",
                group.slug,
            );
        });

        selectedRecipients.forEach((recipient)=>{
            formData.append(
                "recipient_ids[]",
                String(recipient.id)
            )
        })

        formData.append(
            "subject",
            subject,
        );

        formData.append(
            "body",
            body,
        );



        if (scheduledAt) {
            formData.append(
                "scheduled_at",
                new Date(
                    scheduledAt,
                ).toISOString(),
            );
        }


        const filesToUpload =
            await Promise.all(
                attachments.map(
                    compressImage,
                ),
            );

        filesToUpload.forEach((file) => {
            formData.append(
                "attachments[]",
                file,
            );
        });


        try {
            const response = await fetch(
                "/api/emails",
                {
                    method: "POST",
                    body: formData,
                    headers: {
                        Accept: "application/json",
                    },
                },
            );

            if (!response.ok) {
                const result =
                    await response
                        .json()
                        .catch(() => ({}));

                setErrors(
                    result.errors ?? {
                        form: [
                            "Unable to send this email.",
                        ],
                    },
                );

                return;
            }


            setSent(true);

            setAddresses(
                emptyAddresses,
            );

            setAddressInput({
                to: "",
                cc: "",
                bcc: "",
            });

            setSelectedGroups([]);

            setSelectedRecipients([]);

            setShowGroupSelector(false);

            setSubject("");

            setBody("");

            setScheduledAt("");

            setAttachments([]);
        } catch {
            setErrors({
                form: [
                    "The email service could not be reached.",
                ],
            });
        } finally {
            setSending(false);
        }
    }



    return (
        <>
            <Head title="Compose email" />

            <main className="bg-background min-h-[calc(100vh-4rem)] px-4 py-8 sm:px-8">
                <div className="mx-auto max-w-5xl">

                    {/* Header */}
                    <div className="mb-8 flex items-end justify-between gap-4">
                        <div>
                            <p className="text-primary mb-2 text-xs font-semibold tracking-[0.2em] uppercase">
                                Outbox
                            </p>

                            <h1 className="text-3xl font-semibold tracking-tight">
                                Compose email
                            </h1>

                            <p className="text-muted-foreground mt-2 text-sm">
                                Write something worth opening.
                            </p>
                        </div>

                        <div className="bg-accent text-accent-foreground hidden size-12 items-center justify-center rounded-2xl sm:flex">
                            <PenLine className="size-5" />
                        </div>
                    </div>

                    {/* Compose form */}
                    <form
                        onSubmit={submit}
                        className="bg-background overflow-hidden rounded-2xl border shadow-sm"
                    >

                        {/* Recipients */}
                        <RecipientFields
                             selectedRecipients={selectedRecipients}
                             onToggleRecipient={toggleRecipient}
                            addresses={addresses}
                            addressInput={addressInput}
                            errors={errors}
                            recipientGroups={
                                recipientGroups
                            }
                            selectedGroups={
                                selectedGroups
                            }
                            loadingGroups={
                                loadingGroups
                            }
                            showGroupSelector={
                                showGroupSelector
                            }
                            onInputChange={
                                handleInputChange
                            }
                            onAddAddress={
                                addAddresses
                            }
                            onKeyDown={
                                handleAddressKeyDown
                            }
                            onRemoveAddress={
                                removeAddress
                            }
                            onToggleGroup={
                                toggleGroup
                            }
                            onToggleGroupSelector={
                                toggleGroupSelector
                            }
                            onRemoveGroup={
                                removeGroup
                            }
                        />

                        {/* Subject + editor + schedule */}
                        <ComposeMessage
                            subject={subject}
                            body={body}
                            scheduledAt={
                                scheduledAt
                            }
                            errors={errors}
                            onSubjectChange={
                                setSubject
                            }
                            onBodyChange={
                                setBody
                            }
                            onScheduleChange={
                                setScheduledAt
                            }
                            onClearSchedule={() =>
                                setScheduledAt("")
                            }
                        />

                        {/* Attachments */}
                        <AttachmentList
                            attachments={
                                attachments
                            }
                            onRemove={(fileName) =>
                                setAttachments(
                                    (current) =>
                                        current.filter(
                                            (file) =>
                                                file.name !==
                                                fileName,
                                        ),
                                )
                            }
                        />

                        {/* Footer */}
                        <ComposeFooter
                            fileInputRef={
                                fileInputRef
                            }
                            sending={sending}
                            sent={sent}
                            onFilesChange={
                                handleFiles
                            }
                        />

                        {/* Status */}
                        {(errors.form || sent) && (
                            <div
                                className={`border-t px-5 py-3 text-sm sm:px-8 ${
                                    sent
                                        ? "text-emerald-700 dark:text-emerald-400"
                                        : "text-destructive"
                                }`}
                            >
                                {sent
                                    ? "Your email was queued successfully."
                                    : errors.form?.join(
                                          " ",
                                      )}
                            </div>
                        )}
                    </form>
                </div>
            </main>
        </>
    );
}

Compose.layout = {
    breadcrumbs: [
        {
            title: "Compose email",
            href: "/compose",
        },
    ],
};