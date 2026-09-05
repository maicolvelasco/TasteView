<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;
use App\Enums\RoleLevel;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            [
                'name' => 'Super Admin',
                'slug' => 'super-admin',
                'description' => 'Control total del sistema',
                'level' => RoleLevel::SUPER_ADMIN,
                'is_system' => true,
            ],
            [
                'name' => 'Administrador',
                'slug' => 'admin',
                'description' => 'Gestión de sucursales, usuarios y reportes',
                'level' => RoleLevel::ADMIN,
                'is_system' => true,
            ],
            [
                'name' => 'Gerente',
                'slug' => 'manager',
                'description' => 'Gestión de menú y operaciones de sucursal',
                'level' => RoleLevel::MANAGER,
                'is_system' => true,
            ],
            [
                'name' => 'Cajero',
                'slug' => 'cashier',
                'description' => 'Facturación y cobros',
                'level' => RoleLevel::CASHIER,
                'is_system' => true,
            ],
            [
                'name' => 'Cocinero',
                'slug' => 'chef',
                'description' => 'Preparación de alimentos',
                'level' => RoleLevel::CHEF,
                'is_system' => true,
            ],
            [
                'name' => 'Mesero',
                'slug' => 'waiter',
                'description' => 'Toma de pedidos y atención al cliente',
                'level' => RoleLevel::WAITER,
                'is_system' => true,
            ],
            [
                'name' => 'Cliente',
                'slug' => 'customer',
                'description' => 'Usuario público del menú digital',
                'level' => RoleLevel::CUSTOMER,
                'is_system' => true,
            ],
        ];

        foreach ($roles as $role) {
            Role::firstOrCreate(['slug' => $role['slug']], $role);
        }
    }
}
