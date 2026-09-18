<?php
 
namespace App\Jobs;

use App\Mail\SendEmail;
use App\Models\Email;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Mail\MailManager;

class SendEmailJob implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public function __construct(
        public Email $email,
    ) {}

    public function backoff(): array
    {
        return [10, 30, 60];
    }

    public function handle(MailManager $mail): void
    {
        $this->email->loadMissing('attachments');

        $mailer = $mail->to($this->email->recipient);

        if (! empty($this->email->cc)) {
            $mailer->cc($this->email->cc);
        }

        if (! empty($this->email->bcc)) {
            $mailer->bcc($this->email->bcc);
        }

        $mailer->send(new SendEmail($this->email));
    }
}
