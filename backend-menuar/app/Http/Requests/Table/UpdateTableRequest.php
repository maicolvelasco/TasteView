<?php

declare(strict_types=1);

namespace App\Http\Requests\Table;

use App\Models\RestaurantTable;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTableRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'number' => [
                'sometimes', 'string', 'max:20',
                Rule::unique((new RestaurantTable())->getTable(), 'number')
                    ->where('branch_id', $this->user()->branch_id)
                    ->ignore($this->route('id')),
            ],
            'name' => ['nullable', 'string', 'max:50'],
            'capacity' => ['nullable', 'integer', 'min:1', 'max:50'],
            'status' => ['sometimes', Rule::in(['free', 'occupied', 'reserved', 'cleaning'])],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}