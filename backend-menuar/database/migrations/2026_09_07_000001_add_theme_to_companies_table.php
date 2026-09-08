<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Guarda el tema de colores del negocio (Ajustes > Negocio > Colores):
 * modo (solid | bicolor), color primario y, si el modo es bicolor, un
 * color secundario. Se guarda como JSON porque es información puramente
 * de presentación —no se filtra ni se busca por ella— y así queda
 * abierto a agregar más opciones de personalización a futuro (tipografía,
 * modo oscuro, etc.) sin otra migración.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->json('theme')->nullable()->after('logo_url');
        });
    }

    public function down(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->dropColumn('theme');
        });
    }
};
