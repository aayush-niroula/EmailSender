<?php

namespace App\Mail;

use App\Models\Email;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SendEmail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Email $email
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->email->subject,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.send',
            with: [
                'subject' => $this->email->subject,
                'body' => $this->email->body,
            ],
        );
    }

    public function attachments(): array
    {
        return $this->email->attachments
            ->map(function ($attachment) {
                return Attachment::fromStorageDisk(
                    'public',
                    $attachment->filepath
                )
                    ->as($attachment->file_name)
                    ->withMime($attachment->mime_type);
            })
            ->toArray();
    }
}
