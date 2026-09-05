<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * El índice único original de `branches.code` no tenía en cuenta el
 * soft delete: una sucursal eliminada seguía "ocupando" su código para
 * siempre porque la fila sigue existiendo en la tabla, y no se podía
 * volver a usar ese código en una sucursal nueva.
 *
 * Un índice único compuesto (code, deleted_at) NO resuelve esto: en
 * MySQL/Postgres los NULL no se consideran iguales entre sí dentro de
 * un índice único, así que ese diseño en realidad dejaría de bloquear
 * códigos duplicados entre sucursales activas (todas tendrían
 * deleted_at = NULL). Por eso la unicidad de `code` entre sucursales
 * activas se valida a nivel de aplicación (ver StoreBranchRequest y
 * UpdateBranchRequest, con `whereNull('deleted_at')`), y aquí solo se
 * deja un índice normal (no único) para mantener rápidas las búsquedas
 * y los filtros por código.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('branches', function (Blueprint $table) {
            $table->dropUnique(['code']);
            $table->index('code');
        });
    }

    public function down(): void
    {
        Schema::table('branches', function (Blueprint $table) {
            $table->dropIndex(['code']);
            $table->unique('code');
        });
    }
};
