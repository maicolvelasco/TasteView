<?php

declare(strict_types=1);

namespace App\Http\Requests\Branch;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreBranchRequest extends FormRequest
{
    public function authorize(): bool
    {
        // La autorización de rol ya la resuelve el middleware de la ruta
        // ('role:ADMIN'). A qué empresa pertenece la sucursal creada se
        // resuelve en el controller, porque depende de si quien pide es
        // Super Admin o no (ver BranchController::store()).
        return true;
    }

    /**
     * Normaliza el código y el nombre antes de validar, para que
     * "suc-001 " y "SUC-001" no puedan coexistir como sucursales
     * distintas por un simple descuido de mayúsculas o espacios.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'code' => $this->filled('code')
                ? strtoupper(trim((string) $this->input('code')))
                : $this->input('code'),
            'name' => $this->filled('name')
                ? trim((string) $this->input('name'))
                : $this->input('name'),
        ]);
    }

    public function rules(): array
    {
        return [
            // Solo el Super Admin puede fijarlo explícitamente; para un
            // Admin normal el controller lo ignora y usa siempre su
            // propia empresa, así que no hay riesgo de privilege escalation.
            'company_id' => ['sometimes', 'integer', 'exists:companies,id'],

            'name' => ['required', 'string', 'max:100'],
            'code' => [
                'required', 'string', 'max:20', 'regex:/^[A-Z0-9\-]+$/',
                // Solo se compara contra sucursales activas: una sucursal
                // eliminada (soft delete) libera su código para reuso.
                Rule::unique('branches', 'code')->whereNull('deleted_at'),
            ],
            'address' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20', 'regex:/^[0-9+\-\s()]+$/'],
            'timezone' => ['nullable', 'timezone'],
            'currency' => ['nullable', 'string', 'size:3', 'regex:/^[A-Z]{3}$/'],
            'tax_rate' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'is_active' => ['sometimes', 'boolean'],

            'settings' => ['nullable', 'array'],
            'settings.receipt_header' => ['nullable', 'string', 'max:150'],
            'settings.receipt_footer' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'code.regex' => 'El código solo puede contener letras, números y guiones (ej: SUC-001).',
            'code.unique' => 'Ya existe una sucursal con ese código.',
            'phone.regex' => 'El teléfono contiene caracteres no válidos.',
            'currency.regex' => 'La moneda debe ser un código ISO de 3 letras en mayúsculas (ej: BOB, USD).',
            'timezone.timezone' => 'La zona horaria no es válida.',
        ];
    }
}
