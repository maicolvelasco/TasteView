<?php

declare(strict_types=1);

namespace App\Http\Resources\Menu;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OptionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'price_adjustment' => (float) $this->price_adjustment,
            'is_default' => $this->is_default,
        ];
    }
}