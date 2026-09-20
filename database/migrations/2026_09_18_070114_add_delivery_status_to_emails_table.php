<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('emails', function (Blueprint $table) {
            $table->string('delivery_status')->default('queued')->after('in_reply_to');
            $table->timestamp('delivered_at')->nullable()->after('delivery_status');
            $table->text('failure_reason')->nullable()->after('delivered_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('emails', function (Blueprint $table) {
            $table->dropColumn(['delivery_status', 'delivered_at', 'failure_reason']);
        });
    }
};
