<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\RestaurantTable;
use App\Models\Branch;
use Illuminate\Support\Str;

class TableSeeder extends Seeder
{
    public function run(): void
    {
        $branch = Branch::first();
        if (!$branch) return;

        $tables = [
            ['number' => '01', 'name' => 'Terraza 1', 'capacity' => 4],
            ['number' => '02', 'name' => 'Terraza 2', 'capacity' => 4],
            ['number' => '03', 'name' => 'Salón Principal 1', 'capacity' => 6],
            ['number' => '04', 'name' => 'Salón Principal 2', 'capacity' => 6],
            ['number' => '05', 'name' => 'Salón Principal 3', 'capacity' => 2],
            ['number' => '06', 'name' => 'VIP A', 'capacity' => 8],
            ['number' => '07', 'name' => 'VIP B', 'capacity' => 8],
            ['number' => '08', 'name' => 'Barra', 'capacity' => 2],
            ['number' => '09', 'name' => 'Barra', 'capacity' => 2],
            ['number' => '10', 'name' => 'Jardín 1', 'capacity' => 4],
        ];

        foreach ($tables as $t) {
            $qr = 'TABLE-' . strtoupper(Str::random(8)) . '-' . $t['number'];
            RestaurantTable::firstOrCreate(
                ['branch_id' => $branch->id, 'number' => $t['number']],
                array_merge($t, [
                    'branch_id' => $branch->id,
                    'qr_code' => $qr,
                    'status' => 'free',
                    'is_active' => true,
                ])
            );
        }
    }
}
