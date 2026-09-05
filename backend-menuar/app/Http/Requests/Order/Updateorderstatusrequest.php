<?php

declare(strict_types=1);

namespace App\Http\Requests\Order;

use App\Enums\OrderStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateOrderStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // Se valida contra los casos reales del enum en vez de una
            // lista de strings copiada a mano, para que si el enum cambia
            // esta regla no se desactualice silenciosamente.
            'status' => ['required', Rule::in(array_column(OrderStatus::cases(), 'value'))],
        ];
    }
}