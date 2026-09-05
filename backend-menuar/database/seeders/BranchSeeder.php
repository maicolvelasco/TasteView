<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Company;
use App\Models\Branch;

class BranchSeeder extends Seeder
{
    public function run(): void
    {
        $company = Company::firstOrCreate(
            ['slug' => 'restaurante-demo'],
            [
                'name' => 'Restaurante Demo S.A.',
                'phone' => '+591 77777777',
                'email' => 'contacto@restaurantedemo.com',
                'address' => 'Av. Principal #123, Ciudad',
                'tax_id' => '123456789',
            ]
        );

        Branch::firstOrCreate(
            ['code' => 'SUC-001'],
            [
                'company_id' => $company->id,
                'name' => 'Sucursal Principal',
                'address' => 'Av. Principal #123, Zona Centro',
                'phone' => '+591 77777777',
                'timezone' => 'America/La_Paz',
                'currency' => 'BOB',
                'tax_rate' => 13.00,
                'settings' => [
                    'receipt_header' => 'Restaurante Demo S.A.',
                    'receipt_footer' => '¡Gracias por su preferencia!',
                    'kitchen_printer' => 'Cocina_Principal',
                ],
            ]
        );
    }
}
