<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_item_modifiers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_item_id')->constrained('order_items')->cascadeOnDelete();
            $table->foreignId('modifier_option_id')->constrained('modifier_options');
            $table->string('modifier_name', 100)->comment('Snapshot del nombre');
            $table->string('option_name', 100)->comment('Snapshot del nombre de opción');
            $table->decimal('price_adjustment', 12, 2)->default(0)->comment('Snapshot del precio');
            $table->unsignedSmallInteger('quantity')->default(1);
            $table->timestamps();

            $table->index('order_item_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_item_modifiers');
    }
};
