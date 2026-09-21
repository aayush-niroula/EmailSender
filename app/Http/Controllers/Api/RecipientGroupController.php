<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RecipientGroup;

class RecipientGroupController extends Controller
{
    public function index(){
        $groups=RecipientGroup::query()->withCount('recipients')->orderBy('name')->get(['id','name','slug']);

        return response()->json($groups);
    }

    public function recipients(RecipientGroup $group)
    {
        $recipients = $group->recipients()
            ->orderBy('name')
            ->get(['id', 'recipient_group_id', 'name', 'email']);

        return response()->json($recipients);
    }
}
