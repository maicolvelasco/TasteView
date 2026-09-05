<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Serializa una Branch (sucursal) de forma consistente para las
 * respuestas de la API de administración. Centraliza el formato para
 * que el frontend siempre reciba la misma forma, tenga o no cargadas
 * las relaciones/contadores.
 */
class BranchResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'company_id' => $this->company_id,
            'company' => $this->whenLoaded('company', fn () => [
                'id' => $this->company->id,
                'name' => $this->company->name,
            ]),
            'name' => $this->name,
            'code' => $this->code,
            'address' => $this->address,
            'phone' => $this->phone,
            'timezone' => $this->timezone,
            'currency' => $this->currency,
            'tax_rate' => (float) $this->tax_rate,
            'settings' => $this->settings,
            'is_active' => (bool) $this->is_active,
            'stats' => [
                'users_count' => $this->whenCounted('users'),
                'products_count' => $this->whenCounted('products'),
                'tables_count' => $this->whenCounted('restaurantTables'),
                'orders_count' => $this->whenCounted('orders'),
            ],
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            'deleted_at' => $this->when($this->trashed(), fn () => $this->deleted_at?->toIso8601String()),
        ];
    }
}
