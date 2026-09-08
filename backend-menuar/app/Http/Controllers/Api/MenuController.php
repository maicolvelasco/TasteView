<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\Menu\ProductResource;
use App\Models\Branch;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\JsonResponse;

class MenuController extends Controller
{
    /**
     * Menú público de una sucursal, agrupado por categoría.
     * GET /api/menu/{branchCode}
     */
    public function index(string $branchCode): JsonResponse
    {
        $branch = Branch::with('company')->where('code', $branchCode)->where('is_active', true)->first();

        if (!$branch) {
            return response()->json(['status' => false, 'message' => 'Sucursal no encontrada'], 404);
        }

        $categories = Category::where('branch_id', $branch->id)
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        // Una sola query para TODOS los productos de la sucursal (en vez de
        // una por categoría), con modificadores y opciones eager-loaded
        // (otra query más, en vez de una por producto y una por modificador).
        // Esto reemplaza lo que antes eran decenas/cientos de queries por
        // un puñado fijo, sin importar cuántas categorías o productos haya.
        $productsByCategory = Product::where('branch_id', $branch->id)
            ->whereIn('category_id', $categories->pluck('id'))
            ->orderBy('sort_order')
            ->with('modifiers.options')
            ->get()
            ->groupBy('category_id');

        // Catálogo de TODOS los productos de la sucursal, indexado por ID.
        // Se lo pasamos a cada ProductResource para que, si el producto es
        // un combo, pueda resolver el nombre/foto/modelo 3D de cada plato
        // incluido sin disparar una query adicional por combo (los platos
        // de un combo siempre pertenecen a la misma sucursal).
        $catalog = $productsByCategory->flatten()->keyBy('id');

        $result = $categories->map(fn ($category) => [
            'id' => $category->id,
            'name' => $category->name,
            'slug' => $category->slug,
            'icon' => $category->icon,
            'sort_order' => $category->sort_order,
            'products' => $productsByCategory->get($category->id, collect())
                ->map(fn ($product) => new ProductResource($product, $catalog))
                ->values(),
        ]);

        return response()->json([
            'status' => true,
            'data' => [
                'branch' => [
                    'id' => $branch->id,
                    'name' => $branch->name,
                    'code' => $branch->code,
                    'currency' => $branch->currency,
                    'tax_rate' => $branch->tax_rate,
                    // Branding del negocio (nombre + logo) para el header del
                    // menú público — ver Ajustes > Negocio en el panel. Si la
                    // empresa todavía no configuró nada, el frontend usa su
                    // propio fallback ("Restaurant AR" + ícono genérico).
                    'company' => $branch->company ? [
                        'name' => $branch->company->name,
                        'logo_url' => $branch->company->logo_url,
                        'theme' => $branch->company->theme,
                    ] : null,
                ],
                'categories' => $result,
            ],
        ]);
    }

    /**
     * Detalle público de un producto.
     * GET /api/products/{id}
     */
    public function show(int $id): JsonResponse
    {
        $product = Product::with(['category', 'branch', 'modifiers.options'])->find($id);

        if (!$this->isPubliclyVisible($product)) {
            return response()->json(['status' => false, 'message' => 'Producto no encontrado'], 404);
        }

        return response()->json([
            'status' => true,
            'data' => new ProductResource($product, $this->comboCatalogFor($product)),
        ]);
    }

    /**
     * Trae de un tirón (una sola query) los productos incluidos en un
     * combo, para que ProductResource no tenga que consultarlos uno por
     * uno. Si el producto no es combo, evitamos la query por completo.
     */
    private function comboCatalogFor(Product $product): ?\Illuminate\Support\Collection
    {
        if (!$product->is_combo || empty($product->combo_items)) {
            return null;
        }

        $ids = collect($product->combo_items)->pluck('product_id')->filter()->unique()->values();

        return Product::whereIn('id', $ids)->get()->keyBy('id');
    }

    /**
     * Un producto es visible públicamente si existe y tanto su sucursal
     * como su categoría siguen activas. Antes show() solo chequeaba que el
     * producto existiera: se podía acceder por ID a productos de una
     * sucursal ya desactivada o de una categoría oculta del menú.
     */
    private function isPubliclyVisible(?Product $product): bool
    {
        return $product
            && ($product->branch?->is_active ?? false)
            && ($product->category?->is_active ?? false);
    }
}