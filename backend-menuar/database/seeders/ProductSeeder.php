<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\Category;
use App\Models\Branch;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $branch = Branch::first();
        if (!$branch) return;

        $products = [
            // Entradas
            [
                'category' => 'entradas',
                'name' => 'Bruschetta Clásica',
                'price' => 35.00,
                'description' => 'Pan tostado con tomate, albahaca y aceite de oliva.',
                'history' => 'Originaria de Italia central, la bruschetta era el desayuno de los campesinos.',
                'ingredients' => 'Pan artesanal, tomate cherry, albahaca fresca, ajo, aceite de oliva extra virgen',
                'prep_time' => 10,
            ],
            [
                'category' => 'entradas',
                'name' => 'Carpaccio de Res',
                'price' => 58.00,
                'description' => 'Láminas finas de res con aderezo de mostaza y alcaparras.',
                'history' => 'Inventado en 1950 por Giuseppe Cipriani del Harry\'s Bar en Venecia.',
                'ingredients' => 'Lomo fino, aceite de oliva, limón, alcaparras, queso parmesano',
                'prep_time' => 15,
            ],
            // Platos Principales
            [
                'category' => 'platos-principales',
                'name' => 'Filete Mignon',
                'price' => 120.00,
                'description' => 'Corte premium de res a la parrilla con salsa de vino tinto.',
                'history' => 'El filete mignon es uno de los cortes más tiernos, extraído del solomillo.',
                'ingredients' => 'Solomillo de res, vino tinto, mantequilla, tomillo, pimienta negra',
                'prep_time' => 25,
                'has_modifiers' => true,
            ],
            [
                'category' => 'platos-principales',
                'name' => 'Salmón a la Parrilla',
                'price' => 95.00,
                'description' => 'Filete de salmón fresco con salsa de eneldo y limón.',
                'history' => 'El salmón ha sido alimento base en Escandinavia desde la época vikinga.',
                'ingredients' => 'Salmón fresco, eneldo, limón, mantequilla, espárragos',
                'prep_time' => 20,
                'has_modifiers' => true,
            ],
            // Postres
            [
                'category' => 'postres',
                'name' => 'Tiramisú Casero',
                'price' => 42.00,
                'description' => 'Clásico postre italiano con café mascarpone y cacao.',
                'history' => 'Su nombre significa "levántame" en italiano, por su efecto energizante.',
                'ingredients' => 'Queso mascarpone, café espresso, bizcochos savoiardi, cacao, licor Amaretto',
                'prep_time' => 15,
            ],
            // Bebidas
            [
                'category' => 'bebidas',
                'name' => 'Limonada de Hierbabuena',
                'price' => 18.00,
                'description' => 'Refrescante limonada natural con hierbabuena fresca.',
                'history' => 'La limonada se remonta al antiguo Egipto, donde se consumía una bebida similar.',
                'ingredients' => 'Limón fresco, hierbabuena, azúcar de caña, agua mineral',
                'prep_time' => 5,
                'has_modifiers' => true,
            ],
        ];

        foreach ($products as $prod) {
            $category = Category::where('slug', $prod['category'])->where('branch_id', $branch->id)->first();
            if (!$category) continue;

            Product::firstOrCreate(
                ['branch_id' => $branch->id, 'slug' => Str::slug($prod['name'])],
                [
                    'branch_id' => $branch->id,
                    'category_id' => $category->id,
                    'name' => $prod['name'],
                    'description' => $prod['description'],
                    'history' => $prod['history'] ?? null,
                    'ingredients' => $prod['ingredients'] ?? null,
                    'price' => $prod['price'],
                    'cost' => $prod['price'] * 0.35,
                    'preparation_time_min' => $prod['prep_time'],
                    'is_available' => true,
                    'has_modifiers' => $prod['has_modifiers'] ?? false,
                    'sort_order' => 0,
                ]
            );
        }
    }
}
