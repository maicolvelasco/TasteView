<?php

namespace App\Http\Requests\Modifier;

use Illuminate\Foundation\Http\FormRequest;

class StoreModifierRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'branch_id' => 'required|exists:branches,id',
            'name' => 'required|string|max:100',
            'description' => 'nullable|string',
            'min_selections' => 'nullable|integer|min:0',
            'max_selections' => 'nullable|integer|min:1',
            'options' => 'required|array|min:1',
            'options.*.name' => 'required|string|max:100',
            'options.*.price_adjustment' => 'nullable|numeric',
        ];
    }
}