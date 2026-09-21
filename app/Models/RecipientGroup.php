<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RecipientGroup extends Model
{
     protected $fillable=[
        'name','slug'
    ];
    public function recipients():HasMany{
     return $this->hasMany(Recipient::class);
    }
}
