<?php

use App\Http\Controllers\Api\EmailController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', fn () => Inertia::render('welcome'))->name('home');
Route::get('compose', fn () => Inertia::render('compose'))->name('compose');
Route::get('emails', [EmailController::class, 'index'])->name('emails');

Route::get('emails/{email}', [EmailController::class, 'show'])
    ->name('emails.show');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', fn () => Inertia::render('dashboard'))->name('dashboard');
});

require __DIR__.'/settings.php';
