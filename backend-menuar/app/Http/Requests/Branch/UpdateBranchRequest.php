<?php

declare(strict_types=1);

namespace App\Http\Requests\Branch;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateBranchRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Igual que en Store: el rol lo resuelve el middleware de ruta,
        // y la pertenencia a la empresa correcta se valida en el
        // controller vía AuthorizesCompanyAccess (necesita cargar la
        // sucursal desde la BD, algo que aún no ocurrió en este punto).
        return true;
    }

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
        $branchId = $this->route('id');

        return [
            // Mover una sucursal a otra empresa es una operación delicada:
            // el controller la ignora salvo que quien la pida sea Super Admin.
            'company_id' => ['sometimes', 'integer', 'exists:companies,id'],

            'name' => ['sometimes', 'string', 'max:100'],
            'code' => [
                'sometimes', 'string', 'max:20', 'regex:/^[A-Z0-9\-]+$/',
                Rule::unique('branches', 'code')->ignore($branchId)->whereNull('deleted_at'),
            ],
            'address' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20', 'regex:/^[0-9+\-\s()]+$/'],
            'timezone' => ['sometimes', 'timezone'],
            'currency' => ['sometimes', 'string', 'size:3', 'regex:/^[A-Z]{3}$/'],
            'tax_rate' => ['sometimes', 'numeric', 'min:0', 'max:100'],
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
