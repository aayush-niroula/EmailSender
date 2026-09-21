<?php

namespace App\Models;


use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Recipient extends Model
{
    protected $fillable=[
       'recipient_group_id',
       'name',
       'email'
    ];
    public function recipients():BelongsTo{
     return $this->belongsTo(RecipientGroup::class,'recipient_group_id');
    }
}
