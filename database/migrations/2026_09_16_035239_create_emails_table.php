<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('emails', function (Blueprint $table) {
            $table->id();

            $table->string('thread_id')->nullable();

            $table->string('sender')->nullable();
            $table->json('recipient');

            $table->json('cc')->nullable();
            $table->json('bcc')->nullable();

            $table->string('subject');
            $table->longText('body');

            $table->string('message_id')->nullable();
            $table->string('in_reply_to')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('emails');
    }
};
