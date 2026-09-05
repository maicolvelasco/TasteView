<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('modifier_options', function (Blueprint $table) {
            $table->id();
            $table->foreignId('modifier_id')->constrained('modifiers')->cascadeOnDelete();
            $table->string('name', 100);
            $table->decimal('price_adjustment', 12, 2)->default(0)->comment('Positivo o negativo');
            $table->boolean('is_default')->default(false);
            $table->boolean('is_active')->default(true);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index(['modifier_id', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('modifier_options');
    }
};
