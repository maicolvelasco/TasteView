<?php

declare(strict_types=1);

namespace App\Http\Requests\Branch;

use Illuminate\Foundation\Http\FormRequest;

class IndexBranchRequest extends FormRequest
{
    public function authorize(): bool
    {
        // La autorización de rol ya la resuelve el middleware de la ruta
        // ('role:ADMIN'); el aislamiento por empresa se aplica en el
        // controller (ver BranchController::index()).
        return true;
    }

    /**
     * Los query params SIEMPRE llegan como string (?is_active=true es el
     * string "true", no el booleano true). La regla 'boolean' de Laravel
     * solo acepta true, false, 1, 0, '1', '0' — pero NO acepta los
     * strings "true"/"false" que cualquier cliente HTTP normal manda al
     * serializar un booleano en la URL (axios, fetch, Postman, etc.).
     * Sin esta normalización, un filtro tan común como `?is_active=true`
     * rompía con "The is active field must be true or false.", un error
     * de validación que no tiene nada que ver con lo que el usuario hizo
     * mal. Se normaliza ANTES de validar, así la regla 'boolean' de abajo
     * siempre recibe un valor que sabe interpretar.
     */
    protected function prepareForValidation(): void
    {
        $normalized = [];

        foreach (['is_active', 'with_trashed'] as $field) {
            if ($this->has($field)) {
                $normalized[$field] = filter_var($this->input($field), FILTER_VALIDATE_BOOLEAN);
            }
        }

        if ($normalized !== []) {
            $this->merge($normalized);
        }
    }

    public function rules(): array
    {
        return [
            'search' => ['sometimes', 'string', 'max:100'],
            'is_active' => ['sometimes', 'boolean'],
            // Solo tiene efecto para el Super Admin: le permite mirar las
            // sucursales de una empresa concreta en vez de todas.
            'company_id' => ['sometimes', 'integer', 'exists:companies,id'],
            // Solo tiene efecto para el Super Admin: incluye sucursales
            // eliminadas (soft delete) en el listado.
            'with_trashed' => ['sometimes', 'boolean'],
        ];
    }
}
