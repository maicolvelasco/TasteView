<?php

declare(strict_types=1);

namespace App\Http\Requests\Invoice;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreInvoiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        // La autorización fina (¿es de su sucursal?) se hace en el
        // controller, porque depende de datos del pedido que todavía
        // no se cargaron en este punto del ciclo de vida del request.
        return true;
    }

    public function rules(): array
    {
        return [
            'order_id' => ['required', 'integer', 'exists:orders,id'],
            'customer_name' => ['nullable', 'string', 'max:100'],
            'customer_nit' => ['nullable', 'string', 'max:50'],
            'has_tax' => ['required', 'boolean'],
            'payment_method' => ['required', Rule::in(['cash', 'card', 'transfer', 'qr'])],
        ];
    }
}