<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\Branch;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $branch = Branch::first();
        if (!$branch) return;

        $categories = [
            ['name' => 'Entradas', 'icon' => '🥗', 'sort_order' => 1],
            ['name' => 'Sopas', 'icon' => '🍲', 'sort_order' => 2],
            ['name' => 'Platos Principales', 'icon' => '🍽️', 'sort_order' => 3],
            ['name' => 'Parrilla', 'icon' => '🥩', 'sort_order' => 4],
            ['name' => 'Pastas', 'icon' => '🍝', 'sort_order' => 5],
            ['name' => 'Postres', 'icon' => '🍰', 'sort_order' => 6],
            ['name' => 'Bebidas', 'icon' => '🍹', 'sort_order' => 7],
            ['name' => 'Café y Té', 'icon' => '☕', 'sort_order' => 8],
        ];

        foreach ($categories as $cat) {
            Category::firstOrCreate(
                ['branch_id' => $branch->id, 'slug' => Str::slug($cat['name'])],
                array_merge($cat, [
                    'branch_id' => $branch->id,
                    'description' => 'Categoría de ' . $cat['name'],
                    'is_active' => true,
                ])
            );
        }
    }
}
