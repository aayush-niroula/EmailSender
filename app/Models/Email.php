<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Email extends Model
{
    //
    protected $fillable = [
        'thread_id',
        'sender',
        'recipient',
        'cc',
        'bcc',
        'subject',
        'body',
        'scheduled_at',
        'message_id',
        'in_reply_to',
    ];

    protected $casts = [
        'recipient' => 'array',
        'cc' => 'array',
        'bcc' => 'array',
        'scheduled_at' => 'datetime',
    ];

    public function attachments(): HasMany
    {
        return $this->hasMany(Attachment::class);
    }
}
