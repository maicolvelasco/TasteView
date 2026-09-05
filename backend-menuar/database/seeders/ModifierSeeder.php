<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Modifier;
use App\Models\ModifierOption;
use App\Models\Product;
use App\Models\ProductModifier;
use App\Models\Branch;

class ModifierSeeder extends Seeder
{
    public function run(): void
    {
        $branch = Branch::first();
        if (!$branch) return;

        // 1. Término de cocción (para carnes)
        $termModifier = Modifier::firstOrCreate(
            ['branch_id' => $branch->id, 'name' => 'Término de Cocción'],
            [
                'description' => 'Elige cómo quieres tu carne',
                'min_selections' => 1,
                'max_selections' => 1,
            ]
        );

        $termOptions = [
            ['name' => 'Azul (Blue)', 'price_adjustment' => 0],
            ['name' => 'Poco hecho (Rare)', 'price_adjustment' => 0],
            ['name' => 'A punto (Medium)', 'price_adjustment' => 0],
            ['name' => 'Bien hecho (Well Done)', 'price_adjustment' => 0],
        ];
        foreach ($termOptions as $opt) {
            ModifierOption::firstOrCreate(
                ['modifier_id' => $termModifier->id, 'name' => $opt['name']],
                array_merge($opt, ['is_active' => true])
            );
        }

        // 2. Guarniciones
        $sideModifier = Modifier::firstOrCreate(
            ['branch_id' => $branch->id, 'name' => 'Guarnición'],
            [
                'description' => 'Elige tu acompañamiento',
                'min_selections' => 1,
                'max_selections' => 2,
            ]
        );

        $sideOptions = [
            ['name' => 'Papas Fritas', 'price_adjustment' => 0],
            ['name' => 'Papas al Horno', 'price_adjustment' => 0],
            ['name' => 'Ensalada Mixta', 'price_adjustment' => 0],
            ['name' => 'Puré de Papa', 'price_adjustment' => 0],
            ['name' => 'Arroz Pilaf', 'price_adjustment' => 5.00],
            ['name' => 'Vegetales Salteados', 'price_adjustment' => 8.00],
        ];
        foreach ($sideOptions as $opt) {
            ModifierOption::firstOrCreate(
                ['modifier_id' => $sideModifier->id, 'name' => $opt['name']],
                array_merge($opt, ['is_active' => true])
            );
        }

        // 3. Tipo de leche (para bebidas)
        $milkModifier = Modifier::firstOrCreate(
            ['branch_id' => $branch->id, 'name' => 'Tipo de Bebida'],
            [
                'description' => 'Personaliza tu bebida',
                'min_selections' => 0,
                'max_selections' => 2,
            ]
        );

        $milkOptions = [
            ['name' => 'Con hielo extra', 'price_adjustment' => 0],
            ['name' => 'Sin azúcar', 'price_adjustment' => 0],
            ['name' => 'Con leche de almendras', 'price_adjustment' => 8.00],
            ['name' => 'Con leche de soya', 'price_adjustment' => 6.00],
            ['name' => 'Con sirope de vainilla', 'price_adjustment' => 5.00],
        ];
        foreach ($milkOptions as $opt) {
            ModifierOption::firstOrCreate(
                ['modifier_id' => $milkModifier->id, 'name' => $opt['name']],
                array_merge($opt, ['is_active' => true])
            );
        }

        // Asociar modificadores a productos
        $filete = Product::where('slug', 'filete-mignon')->where('branch_id', $branch->id)->first();
        $salmon = Product::where('slug', 'salmon-a-la-parrilla')->where('branch_id', $branch->id)->first();
        $limonada = Product::where('slug', 'limonada-de-hierbabuena')->where('branch_id', $branch->id)->first();

        if ($filete) {
            ProductModifier::firstOrCreate(
                ['product_id' => $filete->id, 'modifier_id' => $termModifier->id],
                ['is_required' => true, 'min_selections' => 1, 'max_selections' => 1]
            );
            ProductModifier::firstOrCreate(
                ['product_id' => $filete->id, 'modifier_id' => $sideModifier->id],
                ['is_required' => true, 'min_selections' => 1, 'max_selections' => 2]
            );
            $filete->update(['has_modifiers' => true]);
        }

        if ($salmon) {
            ProductModifier::firstOrCreate(
                ['product_id' => $salmon->id, 'modifier_id' => $sideModifier->id],
                ['is_required' => true, 'min_selections' => 1, 'max_selections' => 2]
            );
            $salmon->update(['has_modifiers' => true]);
        }

        if ($limonada) {
            ProductModifier::firstOrCreate(
                ['product_id' => $limonada->id, 'modifier_id' => $milkModifier->id],
                ['is_required' => false, 'min_selections' => 0, 'max_selections' => 2]
            );
            $limonada->update(['has_modifiers' => true]);
        }

        // 4. Ejemplo: opciones para Bruschetta Clásica (con/sin papas, término de cocción)
        $papasModifier = Modifier::firstOrCreate(
            ['branch_id' => $branch->id, 'name' => 'Acompañamiento'],
            [
                'description' => 'Elige si quieres papas con tu plato',
                'min_selections' => 1,
                'max_selections' => 1,
            ]
        );

        $papasOptions = [
            ['name' => 'Con papas', 'price_adjustment' => 0],
            ['name' => 'Sin papas', 'price_adjustment' => 0],
        ];
        foreach ($papasOptions as $opt) {
            ModifierOption::firstOrCreate(
                ['modifier_id' => $papasModifier->id, 'name' => $opt['name']],
                array_merge($opt, ['is_active' => true])
            );
        }

        $bruschetta = Product::where('slug', 'bruschetta-clasica')->where('branch_id', $branch->id)->first();

        if ($bruschetta) {
            ProductModifier::firstOrCreate(
                ['product_id' => $bruschetta->id, 'modifier_id' => $papasModifier->id],
                ['is_required' => true, 'min_selections' => 1, 'max_selections' => 1]
            );
            ProductModifier::firstOrCreate(
                ['product_id' => $bruschetta->id, 'modifier_id' => $termModifier->id],
                ['is_required' => false, 'min_selections' => 0, 'max_selections' => 1]
            );
            $bruschetta->update(['has_modifiers' => true]);
        }
    }
}