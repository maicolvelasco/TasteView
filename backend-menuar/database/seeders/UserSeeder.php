<?php

namespace Database\Seeders;

use App\Enums\RoleLevel;
use App\Models\Branch;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Seguridad: este seeder crea contraseñas y PINs de ejemplo
        // conocidos (password123, 1234, etc). Nunca debe correr en
        // producción con datos reales.
        if (app()->environment('production')) {
            $this->command?->warn('UserSeeder omitido: no se ejecuta en producción.');

            return;
        }

        $branch = Branch::first();

        $users = [
            [
                'name' => 'Super Admin',
                'email' => 'superadmin@restaurant.com',
                'password' => 'password123',
                'role' => RoleLevel::SUPER_ADMIN,
            ],
            [
                'name' => 'Administrador',
                'email' => 'admin@restaurant.com',
                'password' => 'password123',
                'role' => RoleLevel::ADMIN,
            ],
            [
                'name' => 'Gerente Principal',
                'email' => 'gerente@restaurant.com',
                'password' => 'password123',
                'role' => RoleLevel::MANAGER,
            ],
            [
                'name' => 'Cajero Juan',
                'email' => 'cajero@restaurant.com',
                'password' => 'password123',
                'role' => RoleLevel::CASHIER,
                'pin_code' => '1234',
            ],
            [
                'name' => 'Chef María',
                'email' => 'chef@restaurant.com',
                'password' => 'password123',
                'role' => RoleLevel::CHEF,
                'pin_code' => '5678',
            ],
            [
                'name' => 'Mesero Carlos',
                'email' => 'mesero@restaurant.com',
                'password' => 'password123',
                'role' => RoleLevel::WAITER,
                'pin_code' => '9012',
            ],
        ];

        foreach ($users as $userData) {
            $roleLevel = $userData['role'];
            unset($userData['role']);

            $role = Role::where('level', $roleLevel->value)->first();

            // password y pin_code se pasan en texto plano a propósito: el
            // cast 'hashed' del modelo User los hashea automáticamente al
            // guardar (mismo mecanismo para ambos campos, sin bcrypt() manual).
            User::firstOrCreate(
                ['email' => $userData['email']],
                array_merge($userData, [
                    'branch_id' => $branch?->id,
                    'role_id' => $role?->id,
                    'is_active' => true,
                ])
            );
        }
    }
}