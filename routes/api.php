<?php

use App\Http\Controllers\Api\EmailController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\RecipientGroupController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/emails', [EmailController::class, 'apiIndex']);
Route::post('/emails', [EmailController::class, 'store']);
Route::delete('/emails/{email}', [EmailController::class, 'destroy']);

Route::post('/emails/{email}/reply', [EmailController::class, 'reply']);

Route::get('/recipient-groups',[RecipientGroupController::class,'index']);
Route::get('/recipient-groups/{group}/recipients', [
    RecipientGroupController::class,
    'recipients',
]);
