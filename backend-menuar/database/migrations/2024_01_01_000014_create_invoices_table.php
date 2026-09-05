<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained('branches')->cascadeOnDelete();
            $table->foreignId('order_id')->constrained('orders');
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete()->comment('Cajero que emitió');
            $table->string('invoice_number', 30)->unique();
            $table->string('customer_name', 100)->nullable();
            $table->string('customer_nit', 50)->nullable()->comment('NIT para factura');
            $table->decimal('subtotal', 12, 2);
            $table->decimal('tax_amount', 12, 2)->default(0);
            $table->decimal('discount_amount', 12, 2)->default(0);
            $table->decimal('total', 12, 2);
            $table->boolean('has_tax')->default(true)->comment('Incluye IVA?');
            $table->string('status', 20)->default('draft');
            $table->timestamp('printed_at')->nullable();
            $table->text('cancellation_reason')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['branch_id', 'status']);
            $table->index(['branch_id', 'created_at']);
            $table->index('invoice_number');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
