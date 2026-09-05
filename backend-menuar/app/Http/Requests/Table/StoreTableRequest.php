<?php

declare(strict_types=1);

namespace App\Http\Requests\Table;

use App\Models\RestaurantTable;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTableRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'number' => [
                'required', 'string', 'max:20',
                // Nombre de tabla resuelto desde el modelo, no escrito a
                // mano: si RestaurantTable no mapea a "tables", esta regla
                // seguía siendo válida sin desactualizarse.
                Rule::unique((new RestaurantTable())->getTable(), 'number')
                    ->where('branch_id', $this->user()->branch_id),
            ],
            'name' => ['nullable', 'string', 'max:50'],
            'capacity' => ['nullable', 'integer', 'min:1', 'max:50'],
        ];
    }
}