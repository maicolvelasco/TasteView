<?php

declare(strict_types=1);

namespace App\Http\Requests\Order;

use App\Models\RestaurantTable;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        // La autorización fina (¿es de su sucursal?, ¿el mesero es válido?)
        // se hace en el controller, porque depende de datos que recién se
        // resuelven ahí (catálogo, otros usuarios).
        return true;
    }

    public function rules(): array
    {
        return [
            'branch_id' => ['required', 'exists:branches,id'],
            // Se resuelve el nombre real de la tabla desde el modelo en vez
            // de escribirlo a mano, para no desincronizarse si el modelo
            // define un $table distinto al de la convención de Laravel.
            'table_id' => ['nullable', Rule::exists((new RestaurantTable())->getTable(), 'id')],
            'customer_name' => ['nullable', 'string', 'max:100'],
            'customer_phone' => ['nullable', 'string', 'max:20'],
            'order_type' => ['required', Rule::in(['dine_in', 'takeout', 'delivery'])],
            'guests_count' => ['nullable', 'integer', 'min:1', 'max:50'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:50'],
            'items.*.notes' => ['nullable', 'string', 'max:500'],
            'items.*.modifiers' => ['nullable', 'array'],
            'items.*.modifiers.*.modifier_option_id' => ['required_with:items.*.modifiers', 'exists:modifier_options,id'],
            'items.*.modifiers.*.quantity' => ['nullable', 'integer', 'min:1'],
            'waiter_id' => ['nullable', 'exists:users,id'],
        ];
    }
}