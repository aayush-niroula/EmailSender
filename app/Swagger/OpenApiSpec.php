<?php

namespace App\Swagger;

use OpenApi\Attributes as OA;

#[OA\Info(
    version: '1.0.0',
    title: 'Email Sender API',
    description: 'Queue emails and replies with optional file attachments.'
)]
#[OA\Server(url: '/', description: 'Application server')]
#[OA\Tag(name: 'Emails', description: 'Email composition and reply operations')]
#[OA\Schema(
    schema: 'Attachment',
    type: 'object',
    required: ['id', 'file_name', 'filepath', 'mime_type', 'file_size'],
    properties: [
        new OA\Property(property: 'id', type: 'integer', example: 1),
        new OA\Property(property: 'file_name', type: 'string', example: 'invoice.pdf'),
        new OA\Property(property: 'filepath', type: 'string', example: 'attachments/abc123.pdf'),
        new OA\Property(property: 'mime_type', type: 'string', example: 'application/pdf'),
        new OA\Property(property: 'file_size', type: 'integer', format: 'int64', example: 245760),
    ]
)]
#[OA\Schema(
    schema: 'Email',
    type: 'object',
    required: ['id', 'sender', 'recipient', 'subject', 'body'],
    properties: [
        new OA\Property(property: 'id', type: 'integer', example: 1),
        new OA\Property(property: 'sender', type: 'string', format: 'email', example: 'sender@example.com'),
        new OA\Property(property: 'recipient', type: 'array', items: new OA\Items(type: 'string', format: 'email')),
        new OA\Property(property: 'cc', type: 'array', items: new OA\Items(type: 'string', format: 'email')),
        new OA\Property(property: 'bcc', type: 'array', items: new OA\Items(type: 'string', format: 'email')),
        new OA\Property(property: 'subject', type: 'string', example: 'Project update'),
        new OA\Property(property: 'body', type: 'string', example: 'Here is the latest update.'),
        new OA\Property(property: 'scheduled_at', type: 'string', format: 'date-time', nullable: true),
        new OA\Property(property: 'message_id', type: 'string', example: '<uuid@gmail.com>'),
        new OA\Property(property: 'in_reply_to', type: 'string', nullable: true),
        new OA\Property(property: 'attachments', type: 'array', items: new OA\Items(ref: '#/components/schemas/Attachment')),
    ]
)]
class OpenApiSpec {}
