<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        // Login por PIN (meseros/cajeros rápido). Solo se pide el PIN:
        // el usuario y su sucursal se detectan automáticamente comparando
        // el PIN contra los usuarios activos (ver AuthController::attemptPinLogin()).
        if ($this->has('pin_code')) {
            return [
                'pin_code' => ['required', 'string', 'digits_between:4,6'],
            ];
        }

        // Login normal por email/password.
        return [
            'email' => ['required', 'email', 'max:255'],
            'password' => ['required', 'string', 'min:4', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'pin_code.digits_between' => 'El PIN debe tener entre 4 y 6 dígitos.',
        ];
    }
}