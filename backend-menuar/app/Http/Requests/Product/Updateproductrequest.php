<?php

namespace App\Http\Requests\Product;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'sometimes|string|max:150',
            'description' => 'nullable|string',
            'history' => 'nullable|string',
            'ingredients' => 'nullable|string',
            'price' => 'sometimes|numeric|min:0',
            'cost' => 'nullable|numeric|min:0',
            'image_url' => 'nullable|string|max:500',
            'model_3d_url' => 'nullable|string|max:500',
            'preparation_time_min' => 'nullable|integer|min:1',
            'is_available' => 'sometimes|boolean',
            'category_id' => 'sometimes|integer|exists:categories,id',
            'is_combo' => 'nullable|boolean',
            'combo_items' => 'nullable|array',
            'combo_items.*.product_id' => 'required_with:combo_items|exists:products,id',
            'combo_items.*.quantity' => 'nullable|integer|min:1',
            // Si el formulario manda "modifiers", se sincroniza la lista completa de opciones
            // asignadas a este producto (se crean, actualizan o quitan según corresponda).
            'modifiers' => 'nullable|array',
            'modifiers.*.modifier_id' => 'required_with:modifiers|exists:modifiers,id',
            'modifiers.*.is_required' => 'nullable|boolean',
            'modifiers.*.disabled_option_ids' => 'nullable|array',
            'modifiers.*.disabled_option_ids.*' => 'integer',
        ];
    }
}