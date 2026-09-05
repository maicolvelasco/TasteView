<?php

declare(strict_types=1);

namespace App\Http\Resources\Menu;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Collection;

class ProductResource extends JsonResource
{
    /**
     * Catálogo opcional (productos de la sucursal, indexados por ID) para
     * resolver los platos de un combo SIN hacer una query extra por cada
     * producto. Lo arma MenuController::index() a partir de los productos
     * que ya cargó de una sola vez; si no se provee (por ejemplo desde
     * MenuController::show(), que solo trae un producto), se resuelve con
     * una query puntual dentro de buildComboItems().
     */
    private ?Collection $comboCatalog;

    public function __construct($resource, ?Collection $comboCatalog = null)
    {
        parent::__construct($resource);
        $this->comboCatalog = $comboCatalog;
    }

    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'history' => $this->history,
            'ingredients' => $this->ingredients,
            'price' => (float) $this->price,
            // 'cost' es información interna del negocio (lo que le cuesta
            // el plato al restaurante): NUNCA debe salir por este endpoint
            // público. Si en el futuro un panel de admin necesita este
            // dato, se sirve desde un Resource distinto detrás de auth.
            'image_url' => $this->image_url,
            'model_3d_url' => $this->model_3d_url,
            'preparation_time_min' => $this->preparation_time_min,
            'is_available' => $this->is_available,
            'has_modifiers' => $this->has_modifiers,
            'is_combo' => $this->is_combo,
            // Los platos que trae el combo, ya resueltos con su nombre,
            // foto y modelo 3D (no solo el ID crudo) para que el menú
            // público pueda mostrarlos y ofrecer su propio visor de AR.
            'combo_items' => $this->buildComboItems(),
            'sort_order' => $this->sort_order,
            'category_id' => $this->category_id,
            'category' => $this->whenLoaded('category', fn () => [
                'id' => $this->category->id,
                'name' => $this->category->name,
                'slug' => $this->category->slug,
            ]),
            'modifiers' => $this->when(
                $this->has_modifiers,
                fn () => ModifierResource::collection($this->modifiers)
            ),
        ];
    }

    /**
     * Resuelve `combo_items` (array crudo de {product_id, quantity}) a
     * la info pública de cada plato incluido. Si un producto referenciado
     * ya no existe (se borró después de armar el combo), se devuelve con
     * `product: null` en vez de romper la respuesta — el frontend decide
     * cómo mostrar ese caso.
     *
     * Nota: no soporta combos anidados (un combo dentro de otro combo);
     * si un ítem del combo resulta ser a su vez un combo, se muestra su
     * propia foto/modelo, no se expande recursivamente.
     */
    private function buildComboItems(): array
    {
        $items = collect($this->combo_items ?? []);
        if ($items->isEmpty()) {
            return [];
        }

        $ids = $items->pluck('product_id')->filter()->unique()->values();

        $catalog = $this->comboCatalog ?? Product::whereIn('id', $ids)->get()->keyBy('id');

        return $items->map(function ($item) use ($catalog) {
            $productId = $item['product_id'] ?? null;
            $product = $productId ? $catalog->get($productId) : null;

            return [
                'product_id' => $productId,
                'quantity' => $item['quantity'] ?? 1,
                'product' => $product ? [
                    'id' => $product->id,
                    'name' => $product->name,
                    'description' => $product->description,
                    'image_url' => $product->image_url,
                    'model_3d_url' => $product->model_3d_url,
                    'price' => (float) $product->price,
                ] : null,
            ];
        })->values()->all();
    }
}
