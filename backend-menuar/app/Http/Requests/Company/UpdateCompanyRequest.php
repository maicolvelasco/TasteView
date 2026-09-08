<?php

declare(strict_types=1);

namespace App\Http\Requests\Company;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCompanyRequest extends FormRequest
{
    public function authorize(): bool
    {
        // El rol lo resuelve el middleware de la ruta ('role:ADMIN'); la
        // pertenencia a la empresa correcta se valida en el controller
        // (CompanyController), vía AuthorizesCompanyAccess.
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->filled('name')) {
            $this->merge(['name' => trim((string) $this->input('name'))]);
        }
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'min:2', 'max:150'],
            // La URL la genera nuestro propio endpoint de subida de
            // imágenes (POST /uploads/image); acá solo se guarda el link.
            // 'sometimes' es clave acá: el form de "Colores" guarda solo
            // `theme` sin mandar `logo_url`, y viceversa el de "Negocio"
            // guarda nombre/logo sin mandar `theme` — sin 'sometimes',
            // cualquiera de los dos guardados borraría el campo que no
            // le pertenece (Laravel trata un campo ausente sin
            // 'sometimes' como null en cuanto la regla es 'nullable').
            'logo_url' => ['sometimes', 'nullable', 'string', 'max:500'],
            // Tema de colores del sistema (Ajustes > Negocio > Colores).
            // 'secondary' solo es obligatorio si el modo es 'bicolor'; en
            // modo 'solid' se ignora aunque venga con algo cargado.
            'theme' => ['sometimes', 'nullable', 'array'],
            'theme.mode' => ['required_with:theme', 'in:solid,bicolor'],
            'theme.primary' => ['required_with:theme', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'theme.secondary' => [
                'nullable',
                'regex:/^#[0-9a-fA-F]{6}$/',
                'required_if:theme.mode,bicolor',
            ],
            // Catálogo cerrado de fuentes (ver utils/theme.js en el
            // frontend); no es texto libre, así que basta con validar el
            // formato de la clave, sin necesidad de duplicar acá la
            // lista completa de fuentes disponibles.
            'theme.font' => ['nullable', 'string', 'max:40', 'regex:/^[a-zA-Z0-9]+$/'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.min' => 'El nombre del negocio es demasiado corto.',
            'theme.primary.regex' => 'El color primario debe ser un color hexadecimal válido (ej: #E67E22).',
            'theme.secondary.regex' => 'El color secundario debe ser un color hexadecimal válido (ej: #3498DB).',
            'theme.secondary.required_if' => 'Elige un color secundario para el modo bicolor.',
        ];
    }
}
