<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('product_modifiers', function (Blueprint $table) {
            // IDs de modifier_options que se excluyen para ESTE producto en particular.
            // Ej: el grupo "Tipo de Bebida" tiene "Con sirope de vainilla", pero ese
            // jugo en particular no debe ofrecerlo -> se guarda su id acá.
            $table->json('disabled_option_ids')->nullable()->after('max_selections');
        });
    }

    public function down(): void
    {
        Schema::table('product_modifiers', function (Blueprint $table) {
            $table->dropColumn('disabled_option_ids');
        });
    }
};
