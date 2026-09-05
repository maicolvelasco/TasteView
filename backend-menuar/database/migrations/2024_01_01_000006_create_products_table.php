<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained('branches')->cascadeOnDelete();
            $table->foreignId('category_id')->constrained('categories')->cascadeOnDelete();
            $table->string('name', 150);
            $table->string('slug', 150);
            $table->text('description')->nullable();
            $table->text('history')->nullable()->comment('Historia o curiosidad del plato');
            $table->text('ingredients')->nullable();
            $table->decimal('price', 12, 2);
            $table->decimal('cost', 12, 2)->default(0)->comment('Costo para calcular margen');
            $table->string('image_url', 500)->nullable();
            $table->string('model_3d_url', 500)->nullable()->comment('URL modelo 3D para AR (glTF/USDZ)');
            $table->unsignedSmallInteger('preparation_time_min')->default(15);
            $table->boolean('is_available')->default(true);
            $table->boolean('has_modifiers')->default(false);
            $table->boolean('is_combo')->default(false);
            $table->json('combo_items')->nullable()->comment('IDs de productos si es combo');
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['branch_id', 'slug']);
            $table->index(['branch_id', 'category_id', 'is_available']);
            $table->index(['branch_id', 'is_available']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
