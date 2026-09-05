<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('branches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
            $table->string('name', 100);
            $table->string('code', 20)->unique()->comment('Código corto de sucursal');
            $table->text('address')->nullable();
            $table->string('phone', 20)->nullable();
            $table->string('timezone', 50)->default('America/La_Paz');
            $table->string('currency', 10)->default('BOB');
            $table->decimal('tax_rate', 5, 2)->default(13.00)->comment('Porcentaje de IVA/IT');
            $table->json('settings')->nullable()->comment('Configuraciones específicas de sucursal');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('branches');
    }
};
