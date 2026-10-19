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
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained()->cascadeOnUpdate();
            $table->string('sku')->unique();
            $table->string('name');
            // Harga disimpan dalam rupiah utuh (tanpa desimal)
            $table->unsignedInteger('price');
            $table->unsignedInteger('stock')->default(0);
            $table->string('emoji')->default('🍽️');
            $table->string('color')->default('bg-gray-100');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['category_id', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
