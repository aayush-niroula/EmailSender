<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\SendEmailJob;
use App\Models\Attachment;
use App\Models\Email;
use App\Services\FileOptimizer;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use OpenApi\Attributes as OA;
use App\Models\RecipientGroup;

class EmailController extends Controller
{
    public function index()
    {
        return Inertia::render('emails', [
            'emails' => Email::query()
                ->with('attachments')
                ->latest()
                ->get(),
        ]);
    }

    #[OA\Get(
        path: '/api/emails',
        operationId: 'listEmails',
        tags: ['Emails'],
        summary: 'List emails',
        responses: [
            new OA\Response(
                response: 200,
                description: 'Emails retrieved successfully',
                content: new OA\JsonContent(
                    type: 'array',
                    items: new OA\Items(ref: '#/components/schemas/Email')
                )
            ),
        ]
    )]
    public function apiIndex()
    {
        return response()->json(
            Email::query()
                ->with('attachments')
                ->latest()
                ->get()
        );
    }

 #[OA\Post(
    path:'/api/emails',
    operationId:'queueEmail',
    tags:['Emails'],
    summary:'Queue an email for delivery',
    requestBody: new OA\RequestBody(
        required:true,
        content:new OA\MediaType(
            mediaType:'multipart/formdata',
            schema: new OA\Schema(
                required:["to",'subject','body'],
                properties:[
                    new OA\Property(property:'to[]',type:'array',minItems:1, items:new OA\Items(
                        type:'string',format:'email' )),
                    new OA\Property(property:'cc[]',type:'array',minItems:1, items:new OA\Items(
                        type:'string',format:'email')),
                    new OA\Property(property:'bcc[]',type:'array',minItems:1, items:new OA\Items(
                        type:'string',format:'email')),
                    new OA\Property(property:'subject',type:'string',maxLength:255,example:'Project example'),
                    new OA\Property(property:'body',type:'string',example:'Here is the latest update'),
                    new OA\Property(property:'scheduled_at',type:'string',format:'date-time',nullabe:true),
                    new OA\Property(property:'attachments[]',type:'array',items:new OA\Items(type:'string',format:'binary') )
                ]
            )
        )
    ),
    responses:[
        new OA\Response(response:202,description:'Email queued successfully'),
        new OA\Response(response:402,description:'Validation error'),
    ]
 )]
    public function store(
        Request $request,
        FileOptimizer $fileOptimizer
    ) {


        $request->validate([
            'to' => [
                'nullable',
                'array',
            ],

            'to.*' => [
                'required',
                'email',
                'distinct',
            ],

            'cc' => [
                'nullable',
                'array',
            ],

            'cc.*' => [
                'required',
                'email',
                'distinct',
            ],

            'bcc' => [
                'nullable',
                'array',
            ],

            'bcc.*' => [
                'required',
                'email',
                'distinct',
            ],

            'recipient_groups' => [
                'nullable',
                'array',
            ],

            'recipient_groups.*' => [
                'required',
                'string',
                'distinct',
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


        $individualRecipients = $request->input(
            'to',
            []
        );

        $groupSlugs = $request->input(
            'recipient_groups',
            []
        );

        $groupRecipients = [];

        if (! empty($groupSlugs)) {
            $groups = RecipientGroup::query()
                ->whereIn('slug', $groupSlugs)
                ->with('recipients')
                ->get();



            if ($groups->count() !== count(array_unique($groupSlugs))) {
                return response()->json([
                    'message' => 'One or more recipient groups were not found.',
                ], 422);
            }


            foreach ($groups as $group) {
                foreach ($group->recipients as $recipient) {
                    $groupRecipients[] = $recipient->email;
                }
            }
        }



        $allRecipients = array_merge(
            $individualRecipients,
            $groupRecipients
        );


        $allRecipients = collect($allRecipients)
            ->map(fn ($email) => strtolower(trim($email)))
            ->filter()
            ->unique()
            ->values()
            ->all();



        if (empty($allRecipients)) {
            return response()->json([
                'message' => 'At least one recipient or recipient group is required.',
                'errors' => [
                    'to' => [
                        'Please add at least one recipient or select a recipient group.',
                    ],
                ],
            ], 422);
        }



        $cc = collect(
            $request->input('cc', [])
        )
            ->map(fn ($email) => strtolower(trim($email)))
            ->filter()
            ->unique()
            ->values()
            ->all();

        $bcc = collect(
            $request->input('bcc', [])
        )
            ->map(fn ($email) => strtolower(trim($email)))
            ->filter()
            ->unique()
            ->values()
            ->all();



        $scheduledAt = $request->filled('scheduled_at')
            ? Carbon::parse($request->scheduled_at)
            : null;

 

        $emails = [];

        foreach ($allRecipients as $recipient) {
            $email = Email::create([
                'thread_id' => (string) Str::uuid(),

                'sender' => config(
                    'mail.from.address'
                ),

                'recipient' => [
                    $recipient,
                ],

                'cc' => $cc,

                'bcc' => $bcc,

                'subject' => $request->subject,

                'body' => $request->body,

                'scheduled_at' => $scheduledAt,

                'message_id' => Str::uuid()
                    . '@gmail.com',

                'in_reply_to' => null,

                'delivery_status' => 'queued',
            ]);

            $emails[] = $email;
        }



        if ($request->hasFile('attachments')) {
            foreach ($emails as $email) {
                foreach (
                    $request->file('attachments')
                    as $file
                ) {
                    $result =
                        $fileOptimizer->optimize(
                            $file
                        );

                    if (
                        $result['optimized']
                        ?? false
                    ) {
                        Attachment::create([
                            'email_id' => $email->id,

                            'file_name' =>
                                $result['file_name'],

                            'filepath' =>
                                $result['filepath'],

                            'mime_type' =>
                                $result['mime_type'],

                            'file_size' =>
                                $result['file_size'],
                        ]);
                    } else {
                        $path = $file->store(
                            'attachments',
                            'local'
                        );

                        Attachment::create([
                            'email_id' => $email->id,

                            'file_name' =>
                                $file->getClientOriginalName(),

                            'filepath' => $path,

                            'mime_type' =>
                                $file->getMimeType(),

                            'file_size' =>
                                $file->getSize(),
                        ]);
                    }
                }
            }
        }


        foreach ($emails as $email) {
            $job = SendEmailJob::dispatch(
                $email
            );

            if ($email->scheduled_at) {
                $job->delay(
                    $email->scheduled_at
                );
            }
        }



        return response()->json([
            'message' => $scheduledAt
                ? 'Emails scheduled successfully'
                : 'Emails queued successfully',

            'total_recipients' =>
                count($allRecipients),

            'recipients' =>
                $allRecipients,

            'groups' =>
                $groupSlugs,

            'emails' =>
                collect($emails)
                    ->map(function ($email) {
                        return $email->load(
                            'attachments'
                        );
                    }),

        ], 202);
    }

    #[OA\Delete(
        path: '/api/emails/{email}',
        operationId: 'deleteEmail',
        tags: ['Emails'],
        summary: 'Delete an email',
        parameters: [
            new OA\Parameter(
                name: 'email',
                in: 'path',
                required: true,
                description: 'Email ID',
                schema: new OA\Schema(type: 'integer'),
                example: 1
            ),
        ],
        responses: [
            new OA\Response(response: 204, description: 'Email deleted successfully'),
            new OA\Response(response: 404, description: 'Email not found'),
        ]
    )]
    public function destroy(Email $email)
    {
        $email->load('attachments');

        foreach ($email->attachments as $attachment) {
            $disk = Storage::disk('local')->exists($attachment->filepath)
                ? 'local'
                : 'public';

            Storage::disk($disk)->delete($attachment->filepath);
        }

        $email->delete();

        return response()->noContent();
    }

    #[OA\Post(
        path: '/api/emails/{email}/reply',
        operationId: 'queueEmailReply',
        tags: ['Emails'],
        summary: 'Queue a reply to an email',
        parameters: [
            new OA\Parameter(
                name: 'email',
                in: 'path',
                required: true,
                description: 'Email ID to reply to',
                schema: new OA\Schema(type: 'integer'),
                example: 1
            ),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\MediaType(
                mediaType: 'multipart/form-data',
                schema: new OA\Schema(
                    required: ['body'],
                    properties: [
                        new OA\Property(property: 'body', type: 'string', example: 'Thanks for the update.'),
                        new OA\Property(property: 'attachments[]', type: 'array', items: new OA\Items(type: 'string', format: 'binary')),
                    ]
                )
            )
        ),
        responses: [
            new OA\Response(response: 202, description: 'Reply queued successfully'),
            new OA\Response(response: 404, description: 'Email not found'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function reply(
        Request $request,
        Email $email,
        FileOptimizer $fileOptimizer
    ) {
        $request->validate([
            'body' => [
                'required',
                'string',
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

        $reply = Email::create([
            'thread_id' => $email->thread_id,

            'sender' => config('mail.from.address'),

            'recipient' => array_values(array_unique($email->recipient ?? [])),

            'cc' => [],

            'bcc' => [],

            'subject' => str_starts_with($email->subject, 'Re:')
                ? $email->subject
                : 'Re: '.$email->subject,

            'body' => $request->body,

            'scheduled_at' => null,

            'message_id' => Str::uuid().'@gmail.com',

            'in_reply_to' => $email->message_id,
            'delivery_status' => 'queued',
        ]);

        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {

                $result = $fileOptimizer->optimize($file);

                if ($result['optimized'] ?? false) {

                    Attachment::create([
                        'email_id' => $reply->id,
                        'file_name' => $result['file_name'],
                        'filepath' => $result['filepath'],
                        'mime_type' => $result['mime_type'],
                        'file_size' => $result['file_size'],
                    ]);

                } else {

                    $path = $file->store(
                        'attachments',
                        'local'
                    );

                    Attachment::create([
                        'email_id' => $reply->id,
                        'file_name' => $file->getClientOriginalName(),
                        'filepath' => $path,
                        'mime_type' => $file->getMimeType(),
                        'file_size' => $file->getSize(),
                    ]);
                }
            }
        }

        SendEmailJob::dispatch($reply);

        return response()->json([
            'message' => 'Reply queued successfully',
            'email' => $reply->load('attachments'),
        ], 202);
    }

    public function show(Email $email)
    {
        $conversation = Email::query()
            ->where('thread_id', $email->thread_id)
            ->with('attachments')
            ->oldest()
            ->get();

        return Inertia::render('emailshow', [
            'email' => $email->load('attachments'),
            'conversation' => $conversation,
        ]);
    }
}
