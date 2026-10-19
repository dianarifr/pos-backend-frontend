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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_no')->unique();
            $table->foreignId('user_id')->constrained()->cascadeOnUpdate(); // kasir
            // Semua nominal dalam rupiah utuh
            $table->unsignedInteger('subtotal');
            $table->unsignedInteger('discount')->default(0);
            $table->unsignedInteger('tax');
            $table->unsignedInteger('total');
            $table->enum('payment_method', ['tunai', 'qris', 'kartu']);
            $table->unsignedInteger('cash_received')->nullable();
            $table->unsignedInteger('change_amount')->nullable();
            $table->timestamps();

            $table->index(['created_at', 'payment_method']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
