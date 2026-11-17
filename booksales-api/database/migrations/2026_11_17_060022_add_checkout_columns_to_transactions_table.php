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
        Schema::table('transactions', function (Blueprint $table) {
            // nullable supaya pesanan lama (sebelum ada form checkout) tetap valid
            $table->string('recipient_name')->nullable()->after('book_id');
            $table->string('phone', 20)->nullable()->after('recipient_name');
            $table->text('address')->nullable()->after('phone');
            $table->text('note')->nullable()->after('address');
            $table->string('payment_method', 20)->default('cash')->after('note');
            $table->string('payment_proof')->nullable()->after('payment_method');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropColumn([
                'recipient_name',
                'phone',
                'address',
                'note',
                'payment_method',
                'payment_proof',
            ]);
        });
    }
};