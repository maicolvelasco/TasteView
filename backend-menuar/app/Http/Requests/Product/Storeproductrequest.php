<?php

namespace App\Http\Requests\Product;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // La autorización de rol ya la resuelve el middleware de la ruta
    }

    public function rules(): array
    {
        return [
            'branch_id' => 'required|integer|exists:branches,id',
            'category_id' => 'required|integer|exists:categories,id',
            'name' => 'required|string|max:150',
            'description' => 'nullable|string',
            'history' => 'nullable|string',
            'ingredients' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'cost' => 'nullable|numeric|min:0',
            'image_url' => 'nullable|string|max:500',
            'model_3d_url' => 'nullable|string|max:500',
            'preparation_time_min' => 'nullable|integer|min:1',
            'is_available' => 'nullable|boolean',
            'is_combo' => 'nullable|boolean',
            'combo_items' => 'nullable|array',
            'combo_items.*.product_id' => 'required_with:combo_items|exists:products,id',
            'combo_items.*.quantity' => 'nullable|integer|min:1',
            // Opciones/modificadores asignados directamente al crear el producto (todo en un solo paso)
            'modifiers' => 'nullable|array',
            'modifiers.*.modifier_id' => 'required_with:modifiers|exists:modifiers,id',
            'modifiers.*.is_required' => 'nullable|boolean',
            'modifiers.*.disabled_option_ids' => 'nullable|array',
            'modifiers.*.disabled_option_ids.*' => 'integer',
        ];
    }
}