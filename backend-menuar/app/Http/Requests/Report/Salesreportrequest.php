<?php

declare(strict_types=1);

namespace App\Http\Requests\Report;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SalesReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'period' => ['sometimes', Rule::in(['day', 'week', 'month', 'year'])],
            'branch_id' => ['sometimes', 'integer', 'exists:branches,id'],
        ];
    }
}