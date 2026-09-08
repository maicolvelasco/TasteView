<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\Concerns;

/**
 * Normaliza un nombre (de plato, categoría, modificador, etc.) para
 * comparar duplicados sin que importen mayúsculas/minúsculas ni espacios
 * de más: "Pique", "PIQUE", "  piQue " y "pique" se consideran el mismo
 * nombre. Usado tanto al duplicar platos entre sucursales como al copiar
 * categorías/modificadores hacia una sucursal recién creada.
 */
trait NormalizesNames
{
    protected function normalizeName(string $name): string
    {
        return mb_strtolower(trim(preg_replace('/\s+/', ' ', $name)));
    }
}
