<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_modifiers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->foreignId('modifier_id')->constrained('modifiers')->cascadeOnDelete();
            $table->boolean('is_required')->default(false)->comment('Sobrescribe el default del modificador');
            $table->unsignedTinyInteger('min_selections')->nullable()->comment('NULL = hereda del modificador');
            $table->unsignedTinyInteger('max_selections')->nullable()->comment('NULL = hereda del modificador');
            $table->timestamps();

            $table->unique(['product_id', 'modifier_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_modifiers');
    }
};
