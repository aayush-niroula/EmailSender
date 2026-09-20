import { useState } from 'react';

interface Email {
    id: number;
    sender: string;
    recipient: string[];
    cc: string[];
    bcc: string[];
    subject: string;
    body: string;
    created_at: string;
    attachments?: Attachment[];
}

interface Attachment {
    id: number;
    file_name: string;
    file_size: number;
}

interface Props {
    email: Email;
    conversation: Email[];
}

export default function EmailShow({ email, conversation }: Props) {
    const [showReply, setShowReply] = useState(false);
    const [body, setBody] = useState('');
    const [sending, setSending] = useState(false);

    const sendReply = async () => {
        if (!body.trim()) {
            return;
        }

        try {
            setSending(true);

            const response = await fetch(`/api/emails/${email.id}/reply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    body,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to send reply');
            }

            alert('Reply queued successfully');

            setBody('');
            setShowReply(false);

            window.location.reload();
        } catch (error) {
            console.error(error);
            alert('Failed to send reply');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6 text-black">
            <div className="mx-auto max-w-4xl rounded-lg bg-gray-500 shadow">
                {/* Header */}
                <div className="border-b p-6">
                    <h1 className="text-2xl font-semibold">{email.subject}</h1>

                    <p className="mt-2 text-sm text-black">
                        {conversation.length} messages in this conversation
                    </p>
                </div>

                {/* Conversation */}
                <div className="divide-y">
                    {conversation.map((message) => (
                        <div key={message.id} className="p-6 bg-gray-500">
                            {/* Sender */}
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="font-semibold">
                                        {message.sender}
                                    </p>

                                    <p className="text-sm">
                                        To: {message.recipient.join(', ')}
                                    </p>

                                    {message.cc?.length > 0 && (
                                        <p className="text-sm">
                                            Cc: {message.cc.join(', ')}
                                        </p>
                                    )}
                                </div>

                                <span className="text-sm">
                                    {new Date(
                                        message.created_at,
                                    ).toLocaleString()}
                                </span>
                            </div>

                            {/* Body */}
                            <div className="mt-5 whitespace-pre-wrap">
                                {message.body}
                            </div>

                            {message.attachments?.length ? (
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {message.attachments.map((attachment) => (
                                        <span
                                            key={attachment.id}
                                            className="rounded-md border px-3 py-1 text-xs"
                                        >
                                            {attachment.file_name}
                                        </span>
                                    ))}
                                </div>
                            ) : null}

                            {/* Reply button */}
                            <div className="mt-5">
                                <button
                                    onClick={() => setShowReply(true)}
                                    className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-50"
                                >
                                    ↩ Reply
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Reply composer */}
                {showReply && (
                    <div className="border-t bg-gray-500 p-6">
                        <h2 className="mb-4 font-semibold">Reply</h2>

                        <div className="mb-3 rounded-md border bg-white p-3 text-sm">
                            <span className="">To:</span>{' '}
                            {email.recipient.join(', ')}
                        </div>

                        <div className="mb-3 rounded-md border bg-white p-3 text-sm">
                            <span className="">Subject:</span>{' '}
                            {email.subject.startsWith('Re:')
                                ? email.subject
                                : `Re: ${email.subject}`}
                        </div>

                        <textarea
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            placeholder="Write your reply..."
                            rows={8}
                            className="w-full resize-y rounded-md border bg-white p-4 outline-none focus:ring-2"
                        />

                        <div className="mt-4 flex gap-3">
                            <button
                                onClick={sendReply}
                                disabled={sending || !body.trim()}
                                className="rounded-md bg-black px-5 py-2 text-sm font-medium disabled:opacity-50 text-white"
                            >
                                {sending ? 'Sending...' : 'Send Reply'}
                            </button>

                            <button
                                onClick={() => {
                                    setShowReply(false);
                                    setBody('');
                                }}
                                className="rounded-md border px-5 py-2 text-sm "
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
