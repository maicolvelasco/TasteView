<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Serializa un User de forma consistente para las respuestas de la API.
 * Centraliza el formato que antes estaba duplicado en login() y me().
 */
class UserResource extends JsonResource
{
    public function __construct($resource, private readonly bool $includePermissions = false)
    {
        parent::__construct($resource);
    }

    public function toArray(Request $request): array
    {
        $data = [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'role' => [
                'id' => $this->role?->id,
                'name' => $this->role?->name,
                'slug' => $this->role?->slug,
                'level' => $this->role?->level?->value,
            ],
            'branch' => $this->branch ? [
                'id' => $this->branch->id,
                'name' => $this->branch->name,
                'tax_rate' => $this->branch->tax_rate,
            ] : null,
        ];

        // Datos de perfil extendido y permisos: solo en /me, no en el login.
        if ($this->includePermissions) {
            $data['phone'] = $this->phone;
            $data['avatar_url'] = $this->avatar_url;
            $data['permissions'] = [
                'can_view_all_orders' => $this->canViewAllOrders(),
                'can_manage_menu' => $this->canManageMenu(),
                'can_manage_branches' => $this->canManageBranches(),
                'can_manage_users' => $this->canManageUsers(),
            ];
        }

        return $data;
    }
}