<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\SendEmailJob;
use App\Models\Attachment;
use App\Models\Email;
use App\Services\FileOptimizer;
use Carbon\Carbon;
use Illuminate\Http\Request;

class EmailController extends Controller
{
    public function store(
        Request $request,
        FileOptimizer $fileOptimizer
    ) {

        $request->validate([
            'to' => [
                'required',
                'array',
                'min:1',
            ],

            'to.*' => [
                'required',
                'email',
            ],

            'cc' => [
                'nullable',
                'array',
            ],

            'cc.*' => [
                'required',
                'email',
            ],

            'bcc' => [
                'nullable',
                'array',
            ],

            'bcc.*' => [
                'required',
                'email',
            ],

            'subject' => [
                'required',
                'string',
                'max:255',
            ],

            'body' => [
                'required',
                'string',
            ],

            'scheduled_at' => [
                'nullable',
                'date',
                'after:now',
            ],

            'attachments' => [
                'nullable',
                'array',
            ],

            'attachments.*' => [
                'file',
                'max:10240',
                'mimes:jpg,jpeg,png,gif,pdf,doc,docx,xls,xlsx,txt,zip',
            ],
        ]);

        $email = Email::create([
            'sender' => config('mail.from.address'),

            'recipient' => $request->to,

            'cc' => $request->input('cc', []),

            'bcc' => $request->input('bcc', []),

            'subject' => $request->subject,

            'body' => $request->body,

            'scheduled_at' => $request->filled('scheduled_at')
                ? Carbon::parse($request->scheduled_at)
                : null,
        ]);

        if ($request->hasFile('attachments')) {

            foreach ($request->file('attachments') as $file) {

                $result = $fileOptimizer->optimize($file);

                if ($result['optimized'] ?? false) {

                    Attachment::create([
                        'email_id' => $email->id,

                        'file_name' => $result['file_name'],

                        'filepath' => $result['filepath'],

                        'mime_type' => $result['mime_type'],

                        'file_size' => $result['file_size'],
                    ]);
                } else {

                    $path = $file->store(
                        'attachments',
                        'public'
                    );

                    Attachment::create([
                        'email_id' => $email->id,

                        'file_name' => $file->getClientOriginalName(),

                        'filepath' => $path,

                        'mime_type' => $file->getMimeType(),

                        'file_size' => $file->getSize(),
                    ]);
                }
            }
        }

        $job = SendEmailJob::dispatch($email);

        if ($email->scheduled_at) {
            $job->delay($email->scheduled_at);
        }

        return response()->json([
            'message' => $email->scheduled_at
                ? 'Email scheduled successfully'
                : 'Email queued successfully',

            'email' => $email,

            'recipients' => $request->to,

            'attachments' => $email->attachments,
        ], 202);
    }
}
