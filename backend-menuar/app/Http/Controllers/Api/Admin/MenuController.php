<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\Concerns\ApiResponse;
use App\Http\Controllers\Api\Concerns\AuthorizesBranchAccess;
use App\Http\Controllers\Controller;
use App\Http\Requests\Product\StoreProductRequest;
use App\Http\Requests\Product\UpdateProductRequest;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductModifier;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class MenuController extends Controller
{
    use ApiResponse;
    use AuthorizesBranchAccess;

    // ==================== CATEGORÍAS ====================

    /**
     * Categorías + productos de la sucursal, para el panel de
     * administración (Gestionar Menú). A diferencia del menú público
     * (GET /menu/{branchCode}), esta:
     *  - usa el branch_id de la SESIÓN del usuario, no un código fijo,
     *    así que si el código de la sucursal cambia (ej. SUC-001 -> SU1)
     *    el panel sigue funcionando sin tocar nada;
     *  - trae TODAS las categorías/productos (activos e inactivos), para
     *    que el admin pueda reactivarlos;
     *  - incluye `cost` y demás campos internos que el panel necesita.
     *
     * Un Admin/Super Admin puede pedir explícitamente la de otra
     * sucursal con `?branch_id=`; cualquier otro rol siempre ve la suya.
     * GET /api/menu
     */
    public function index(Request $request): JsonResponse
    {
        $branchId = $this->resolveBranchId($request->user(), $request->query('branch_id'));
        if ($branchId instanceof JsonResponse) {
            return $branchId;
        }

        $categories = Category::where('branch_id', $branchId)
            ->orderBy('sort_order')
            ->get();

        $productsByCategory = Product::where('branch_id', $branchId)
            ->whereIn('category_id', $categories->pluck('id'))
            ->orderBy('sort_order')
            ->with('modifiers.options')
            ->get()
            ->groupBy('category_id');

        $result = $categories->map(fn ($category) => [
            'id' => $category->id,
            'name' => $category->name,
            'slug' => $category->slug,
            'icon' => $category->icon,
            'is_active' => $category->is_active,
            'sort_order' => $category->sort_order,
            'products' => $productsByCategory->get($category->id, collect())->values(),
        ]);

        return $this->ok([
            'branch_id' => $branchId,
            'categories' => $result,
        ]);
    }

    /**
     * POST /api/categories
     */
    public function storeCategory(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'branch_id' => 'required|exists:branches,id',
            'name' => 'required|string|max:100',
            'description' => 'nullable|string',
            'icon' => 'nullable|string|max:50',
            'sort_order' => 'nullable|integer',
        ]);

        if ($response = $this->authorizeBranchAccess($request->user(), $validated['branch_id'])) {
            return $response;
        }

        $category = Category::create(array_merge($validated, [
            'slug' => Str::slug($validated['name']),
            'is_active' => true,
        ]));

        return $this->ok($category, 201);
    }

    /**
     * Editar una categoría (nombre, descripción, ícono, activa/inactiva)
     * PUT /api/categories/{id}
     */
    public function updateCategory(Request $request, int $id): JsonResponse
    {
        $category = Category::findOrFail($id);

        if ($response = $this->authorizeBranchAccess($request->user(), $category->branch_id)) {
            return $response;
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:100',
            'description' => 'nullable|string',
            'icon' => 'nullable|string|max:50',
            'is_active' => 'sometimes|boolean',
        ]);

        if (isset($validated['name'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $category->update($validated);

        return $this->ok($category);
    }

    /**
     * Eliminar una categoría (solo si no tiene productos, para no dejar platos huérfanos)
     * DELETE /api/categories/{id}
     */
    public function destroyCategory(Request $request, int $id): JsonResponse
    {
        $category = Category::findOrFail($id);

        if ($response = $this->authorizeBranchAccess($request->user(), $category->branch_id)) {
            return $response;
        }

        if ($category->products()->exists()) {
            return $this->fail('No puedes eliminar una categoría que tiene productos. Muévelos o elimínalos primero.');
        }

        $category->delete();

        return $this->okMessage('Categoría eliminada');
    }

    /**
     * Reordenar categorías (drag & drop en el panel)
     * POST /api/categories/reorder
     */
    public function reorderCategories(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.id' => 'required|exists:categories,id',
            'items.*.sort_order' => 'required|integer',
        ]);

        $ids = collect($validated['items'])->pluck('id')->all();

        if ($response = $this->authorizeBranchOwnershipOfIds($request->user(), Category::class, $ids)) {
            return $response;
        }

        DB::transaction(function () use ($validated) {
            foreach ($validated['items'] as $item) {
                Category::where('id', $item['id'])->update(['sort_order' => $item['sort_order']]);
            }
        });

        return $this->ok();
    }

    // ==================== PRODUCTOS ====================

    /**
     * Reordenar productos dentro de una categoría (drag & drop en el panel)
     * POST /api/products/reorder
     */
    public function reorderProducts(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.id' => 'required|exists:products,id',
            'items.*.sort_order' => 'required|integer',
        ]);

        $ids = collect($validated['items'])->pluck('id')->all();

        if ($response = $this->authorizeBranchOwnershipOfIds($request->user(), Product::class, $ids)) {
            return $response;
        }

        DB::transaction(function () use ($validated) {
            foreach ($validated['items'] as $item) {
                Product::where('id', $item['id'])->update(['sort_order' => $item['sort_order']]);
            }
        });

        return $this->ok();
    }

    /**
     * Subir una imagen (desde archivo o foto tomada con la cámara) para un producto/categoría
     * POST /api/uploads/image
     */
    public function uploadImage(Request $request): JsonResponse
    {
        $request->validate([
            'image' => 'required|image|max:5120', // máx 5MB
        ]);

        $file = $request->file('image');

        // Conservamos el nombre original (limpio) en vez de un hash random,
        // y si ya existe un archivo con ese nombre le agregamos un sufijo.
        $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
        $extension = strtolower($file->getClientOriginalExtension()) ?: 'jpg';
        $safeName = Str::slug($originalName) ?: 'imagen';

        $filename = $safeName . '.' . $extension;
        $counter = 1;
        while (Storage::disk('uploads')->exists('menu/' . $filename)) {
            $filename = $safeName . '-' . $counter . '.' . $extension;
            $counter++;
        }

        $path = $file->storeAs('menu', $filename, 'uploads');
        $url = Storage::disk('uploads')->url($path);

        return $this->ok(['url' => $url, 'filename' => $filename], 201);
    }

    /**
     * Subir un modelo 3D (.glb/.gltf) para la vista AR de un producto.
     * POST /api/uploads/model
     */
    public function uploadModel(Request $request): JsonResponse
    {
        $request->validate([
            'model' => 'required|file|max:20480', // máx 20MB
        ]);

        $file = $request->file('model');
        $ext = strtolower($file->getClientOriginalExtension()) ?: 'glb';

        if (!in_array($ext, ['glb', 'gltf'], true)) {
            return $this->fail('El archivo debe ser .glb o .gltf');
        }

        $filename = uniqid('model_') . '.' . $ext;
        $path = $file->storeAs('menu/models', $filename, 'uploads');
        $url = Storage::disk('uploads')->url($path);

        return $this->ok(['url' => $url], 201);
    }

    /**
     * Duplicar un producto (y sus opciones asignadas) como punto de partida para una variante
     * POST /api/products/{id}/duplicate
     */
    public function duplicateProduct(Request $request, int $id): JsonResponse
    {
        $product = Product::with('modifiers')->findOrFail($id);

        if ($response = $this->authorizeBranchAccess($request->user(), $product->branch_id)) {
            return $response;
        }

        $copy = DB::transaction(function () use ($product) {
            $copy = $product->replicate(['slug']);
            $copy->name = $product->name . ' (copia)';
            $copy->slug = Str::slug($copy->name) . '-' . Str::lower(Str::random(4));
            $copy->is_available = false; // para que el admin la revise antes de publicarla
            $copy->save();

            foreach ($product->modifiers as $mod) {
                ProductModifier::create([
                    'product_id' => $copy->id,
                    'modifier_id' => $mod->id,
                    'is_required' => $mod->pivot->is_required,
                    'disabled_option_ids' => $mod->pivot->disabled_option_ids,
                ]);
            }

            return $copy;
        });

        return $this->ok($copy, 201);
    }

    /**
     * Duplica un lote de platos de una sucursal a otra, con toda su
     * información (imagen, precio, historia, ingredientes, modelo 3D/AR,
     * modificadores asignados, etc.) — pensado para el caso de "esta
     * sucursal nueva no tiene nada de menú todavía, tráeme lo de la otra".
     *
     * Detección de duplicados: antes de crear cada copia se busca, en la
     * sucursal destino, un plato con el MISMO NOMBRE — comparación
     * insensible a mayúsculas/minúsculas y a espacios de más ("Pique",
     * "PIQUE" y "  pique  " se consideran el mismo plato). Si ya existe:
     *  - y su ID NO viene en `force_ids` → no se duplica; se reporta en
     *    `skipped` para que el frontend pregunte "¿duplicar de todas
     *    formas?" y, si el usuario acepta, se reintente solo esos ids
     *    agregándolos a `force_ids`.
     *  - y su ID SÍ viene en `force_ids` → se duplica igual, sin importar
     *    el nombre repetido (el usuario ya confirmó que lo quiere así).
     *
     * Combos: si un plato duplicado es un combo, sus `combo_items` se
     * "reapuntan": si el plato incluido también se duplicó en este mismo
     * lote, apunta a la copia nueva; si no se duplicó pero ya existe un
     * plato con ese nombre en destino, apunta a ese; si no se encuentra
     * ninguno de los dos, ese ítem se quita de la copia del combo (mejor
     * un combo con un ítem de menos que uno apuntando a otra sucursal).
     *
     * POST /api/products/duplicate-to-branch
     */
    public function duplicateToBranch(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'target_branch_id' => 'required|integer|exists:branches,id',
            'product_ids' => 'required|array|min:1',
            'product_ids.*' => 'integer|exists:products,id',
            'force_ids' => 'nullable|array',
            'force_ids.*' => 'integer',
        ]);

        $user = $request->user();
        $targetBranchId = (int) $validated['target_branch_id'];
        $forceIds = collect($validated['force_ids'] ?? [])->map(fn ($id) => (int) $id)->all();

        $products = Product::with(['category', 'modifiers'])
            ->whereIn('id', $validated['product_ids'])
            ->get();

        if ($products->isEmpty()) {
            return $this->fail('No se encontraron los platos indicados.', 404);
        }

        $sourceBranchIds = $products->pluck('branch_id')->unique();
        if ($sourceBranchIds->count() > 1) {
            return $this->fail('Todos los platos a duplicar deben pertenecer a la misma sucursal de origen.', 422);
        }
        $sourceBranchId = (int) $sourceBranchIds->first();

        if ($sourceBranchId === $targetBranchId) {
            return $this->fail('La sucursal de destino debe ser distinta a la de origen.', 422);
        }

        if ($response = $this->authorizeBranchAccess($user, $sourceBranchId)) {
            return $response;
        }
        if ($response = $this->authorizeBranchAccess($user, $targetBranchId)) {
            return $response;
        }

        // Categorías ya existentes en destino, para reutilizarlas por
        // nombre en vez de crear una categoría duplicada por cada plato.
        $targetCategories = Category::where('branch_id', $targetBranchId)->get();
        $targetCategoryByName = $targetCategories->keyBy(fn ($c) => $this->normalizeDishName($c->name));

        // Platos ya existentes en destino, para la detección de duplicados.
        $targetProductByName = Product::where('branch_id', $targetBranchId)->get()
            ->keyBy(fn ($p) => $this->normalizeDishName($p->name));

        $created = [];
        $skipped = [];
        $idMap = []; // id del plato original -> id de su copia nueva

        DB::transaction(function () use (
            $products, $targetBranchId, $forceIds,
            $targetCategoryByName, $targetProductByName,
            &$created, &$skipped, &$idMap
        ) {
            foreach ($products as $product) {
                $normalizedName = $this->normalizeDishName($product->name);
                $existing = $targetProductByName->get($normalizedName);

                if ($existing && !in_array($product->id, $forceIds, true)) {
                    $skipped[] = [
                        'product_id' => $product->id,
                        'name' => $product->name,
                        'existing' => ['id' => $existing->id, 'name' => $existing->name],
                    ];
                    continue;
                }

                $categoryName = $this->normalizeDishName($product->category->name ?? '');
                $targetCategory = $targetCategoryByName->get($categoryName);
                if (!$targetCategory && $product->category) {
                    $targetCategory = $product->category->replicate();
                    $targetCategory->branch_id = $targetBranchId;
                    $targetCategory->save();
                    $targetCategoryByName->put($categoryName, $targetCategory);
                }

                $copy = $product->replicate(['slug']);
                $copy->branch_id = $targetBranchId;
                $copy->category_id = $targetCategory?->id ?? $product->category_id;
                $copy->slug = Str::slug($product->name) . '-' . Str::lower(Str::random(4));
                // A diferencia de duplicateProduct() (variante dentro de la
                // MISMA sucursal, donde sí conviene forzar `false` para que
                // el admin la revise antes de publicarla), acá se preserva
                // el estado real del plato de origen: si en la sucursal de
                // origen estaba disponible, la copia nace disponible; si
                // estaba pausado, nace pausado — tal cual pediste.
                $copy->is_available = $product->is_available;
                $copy->save();

                foreach ($product->modifiers as $mod) {
                    ProductModifier::create([
                        'product_id' => $copy->id,
                        'modifier_id' => $mod->id,
                        'is_required' => $mod->pivot->is_required,
                        'disabled_option_ids' => $mod->pivot->disabled_option_ids,
                    ]);
                }

                $idMap[$product->id] = $copy->id;
                $created[] = $copy;

                // Para que, dentro del mismo lote, dos platos con nombres
                // repetidos entre sí también se detecten como duplicados.
                $targetProductByName->put($normalizedName, $copy);
            }

            // Segunda pasada: remapear los combo_items de los combos recién
            // duplicados (necesita que todas las copias ya existan con su
            // ID definitivo, por eso va después del bucle de arriba).
            foreach ($created as $copy) {
                if (!$copy->is_combo || empty($copy->combo_items)) {
                    continue;
                }

                $remapped = [];
                foreach ($copy->combo_items as $item) {
                    $originalId = $item['product_id'] ?? null;

                    if ($originalId && isset($idMap[$originalId])) {
                        $item['product_id'] = $idMap[$originalId];
                        $remapped[] = $item;
                        continue;
                    }

                    $originalProduct = $originalId ? Product::find($originalId) : null;
                    $equivalent = $originalProduct
                        ? Product::where('branch_id', $copy->branch_id)
                            ->whereRaw('LOWER(TRIM(name)) = ?', [$this->normalizeDishName($originalProduct->name)])
                            ->first()
                        : null;

                    if ($equivalent) {
                        $item['product_id'] = $equivalent->id;
                        $remapped[] = $item;
                    }
                    // Si no hay copia ni equivalente, se omite ese ítem del
                    // combo en vez de dejarlo apuntando a otra sucursal.
                }

                $copy->combo_items = $remapped;
                $copy->save();
            }
        });

        return $this->ok([
            'created' => collect($created)->map(fn ($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'image_url' => $p->image_url,
                'category_id' => $p->category_id,
            ])->values(),
            'created_count' => count($created),
            'skipped' => $skipped,
        ], 201);
    }

    /**
     * Normaliza un nombre de plato/categoría para comparar duplicados sin
     * que importen mayúsculas/minúsculas ni espacios de más: "Pique",
     * "PIQUE", "  piQue " y "pique" se consideran el mismo nombre.
     */
    private function normalizeDishName(string $name): string
    {
        return mb_strtolower(trim(preg_replace('/\s+/', ' ', $name)));
    }

    /**
     * Detalle completo de un producto para el panel de administración.
     * A diferencia del menú público (GET /menu/{branch_code}), este sí
     * incluye campos internos como `cost`, que el formulario de edición
     * necesita para precargar el costo real.
     * GET /api/products/{id}/detail
     */
    public function showProduct(Request $request, int $id): JsonResponse
    {
        $product = Product::with('modifiers')->findOrFail($id);

        if ($response = $this->authorizeBranchAccess($request->user(), $product->branch_id)) {
            return $response;
        }

        return $this->ok($product);
    }

    /**
     * POST /api/products
     */
    public function storeProduct(StoreProductRequest $request): JsonResponse
    {
        $validated = $request->validated();

        // La regla 'integer' del FormRequest solo valida que el valor
        // "parezca" un entero — NO cambia su tipo en PHP (sigue llegando
        // como string desde el body JSON). Como este archivo tiene
        // declare(strict_types=1), hay que castear explícitamente antes
        // de pasarlo a un parámetro tipado `int`.
        $validated['branch_id'] = (int) $validated['branch_id'];
        $validated['category_id'] = (int) $validated['category_id'];

        if ($response = $this->authorizeBranchAccess($request->user(), $validated['branch_id'])) {
            return $response;
        }

        $this->assertCategoryBelongsToBranch($validated['category_id'], $validated['branch_id']);

        // `cost` es NOT NULL en la BD y no tiene default. Si el formulario
        // lo deja vacío, guardamos 0 en vez de dejar pasar null y romper
        // el insert.
        $validated['cost'] = $validated['cost'] ?? 0;

        $modifiersInput = $validated['modifiers'] ?? [];
        unset($validated['modifiers']);

        $product = DB::transaction(function () use ($validated, $modifiersInput) {
            $product = Product::create(array_merge($validated, [
                'slug' => Str::slug($validated['name']) . '-' . Str::lower(Str::random(4)),
                'has_modifiers' => count($modifiersInput) > 0,
            ]));

            $this->syncProductModifiers($product, $modifiersInput);

            return $product;
        });

        return $this->ok($product->load('modifiers'), 201);
    }

    /**
     * PUT /api/products/{id}
     */
    public function updateProduct(UpdateProductRequest $request, int $id): JsonResponse
    {
        $product = Product::findOrFail($id);

        if ($response = $this->authorizeBranchAccess($request->user(), $product->branch_id)) {
            return $response;
        }

        $validated = $request->validated();

        if (isset($validated['category_id'])) {
            $validated['category_id'] = (int) $validated['category_id'];
            $this->assertCategoryBelongsToBranch($validated['category_id'], $product->branch_id);
        }

        // `cost` es NOT NULL en la BD. Si llega null (el campo vino vacío
        // desde el formulario — típicamente porque la pantalla de edición
        // no tenía el valor real cargado), no lo tocamos: mejor conservar
        // el costo que ya tenía el producto que sobreescribirlo con NULL/0
        // y perder el dato.
        if (array_key_exists('cost', $validated) && $validated['cost'] === null) {
            unset($validated['cost']);
        }

        $syncModifiers = $request->has('modifiers');
        $modifiersInput = $validated['modifiers'] ?? [];
        unset($validated['modifiers']);

        if (isset($validated['name'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        DB::transaction(function () use ($product, $validated, $syncModifiers, $modifiersInput) {
            if ($syncModifiers) {
                $validated['has_modifiers'] = count($modifiersInput) > 0;
            }

            $product->update($validated);

            if ($syncModifiers) {
                $this->syncProductModifiers($product, $modifiersInput, replace: true);
            }
        });

        return $this->ok($product->fresh()->load('modifiers'));
    }

    /**
     * DELETE /api/products/{id}
     */
    public function destroyProduct(Request $request, int $id): JsonResponse
    {
        $product = Product::findOrFail($id);

        if ($response = $this->authorizeBranchAccess($request->user(), $product->branch_id)) {
            return $response;
        }

        $product->delete();

        return $this->okMessage('Producto eliminado');
    }

    // ==================== ASIGNACIÓN DE MODIFICADORES A UN PRODUCTO ====================

    /**
     * POST /api/products/assign-modifier
     */
    public function assignModifier(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'modifier_id' => 'required|exists:modifiers,id',
            'is_required' => 'nullable|boolean',
            'disabled_option_ids' => 'nullable|array',
            'disabled_option_ids.*' => 'integer',
        ]);

        $product = Product::findOrFail($validated['product_id']);

        if ($response = $this->authorizeBranchAccess($request->user(), $product->branch_id)) {
            return $response;
        }

        // updateOrCreate en vez de create: si el modificador ya estaba
        // asignado, actualiza su configuración en lugar de crear una fila
        // duplicada en la tabla pivote.
        ProductModifier::updateOrCreate(
            ['product_id' => $validated['product_id'], 'modifier_id' => $validated['modifier_id']],
            [
                'is_required' => $validated['is_required'] ?? false,
                'disabled_option_ids' => $validated['disabled_option_ids'] ?? [],
            ]
        );

        $product->update(['has_modifiers' => true]);

        return $this->okMessage('Modificador asignado');
    }

    /**
     * Actualizar la configuración de un modificador ya asignado a un producto:
     * qué opciones se excluyen para ESE producto puntual y si es obligatorio.
     * PUT /api/products/{productId}/modifiers/{modifierId}
     */
    public function updateProductModifier(Request $request, int $productId, int $modifierId): JsonResponse
    {
        $product = Product::findOrFail($productId);

        if ($response = $this->authorizeBranchAccess($request->user(), $product->branch_id)) {
            return $response;
        }

        $validated = $request->validate([
            'is_required' => 'nullable|boolean',
            'disabled_option_ids' => 'nullable|array',
            'disabled_option_ids.*' => 'integer',
        ]);

        $pivot = ProductModifier::where('product_id', $productId)
            ->where('modifier_id', $modifierId)
            ->firstOrFail();

        $pivot->update(array_filter([
            'is_required' => $validated['is_required'] ?? null,
            'disabled_option_ids' => array_key_exists('disabled_option_ids', $validated)
                ? $validated['disabled_option_ids']
                : null,
        ], fn ($v) => $v !== null));

        return $this->ok($pivot);
    }

    /**
     * Configuración de modificadores de un producto (para el modal de asignación)
     * GET /api/products/{productId}/modifier-settings
     */
    public function productModifierSettings(Request $request, int $productId): JsonResponse
    {
        $product = Product::findOrFail($productId);

        if ($response = $this->authorizeBranchAccess($request->user(), $product->branch_id)) {
            return $response;
        }

        $rows = ProductModifier::where('product_id', $productId)
            ->get(['modifier_id', 'is_required', 'disabled_option_ids']);

        return $this->ok($rows);
    }

    /**
     * Quitar un modificador de un producto
     * DELETE /api/products/{productId}/modifiers/{modifierId}
     */
    public function unassignModifier(Request $request, int $productId, int $modifierId): JsonResponse
    {
        $product = Product::findOrFail($productId);

        if ($response = $this->authorizeBranchAccess($request->user(), $product->branch_id)) {
            return $response;
        }

        ProductModifier::where('product_id', $productId)
            ->where('modifier_id', $modifierId)
            ->delete();

        $this->refreshHasModifiersFlag($productId);

        return $this->okMessage('Modificador removido del producto');
    }

    // ==================== Helpers privados ====================

    /**
     * Sincroniza las asignaciones de modificadores de un producto.
     * $replace = true: borra las que ya no estén en la lista nueva (usado al editar).
     * $replace = false: solo crea (usado al crear un producto nuevo, no hay nada que borrar).
     */
    private function syncProductModifiers(Product $product, array $modifiersInput, bool $replace = false): void
    {
        if ($replace) {
            $keepIds = collect($modifiersInput)->pluck('modifier_id')->all();
            ProductModifier::where('product_id', $product->id)
                ->whereNotIn('modifier_id', $keepIds ?: [0])
                ->delete();
        }

        foreach ($modifiersInput as $mod) {
            ProductModifier::updateOrCreate(
                ['product_id' => $product->id, 'modifier_id' => $mod['modifier_id']],
                [
                    'is_required' => $mod['is_required'] ?? false,
                    'disabled_option_ids' => $mod['disabled_option_ids'] ?? [],
                ]
            );
        }
    }

    private function refreshHasModifiersFlag(int $productId): void
    {
        $remaining = ProductModifier::where('product_id', $productId)->count();
        if ($remaining === 0) {
            Product::where('id', $productId)->update(['has_modifiers' => false]);
        }
    }

    /**
     * Un producto siempre debe pertenecer a una categoría de SU MISMA
     * sucursal. Sin este chequeo, nada impedía guardar un producto de la
     * Sucursal A colgado de una categoría de la Sucursal B (el menú
     * público de una sucursal terminaría mostrando categorías/productos
     * mezclados de otra).
     */
    private function assertCategoryBelongsToBranch(int $categoryId, int $branchId): void
    {
        $belongs = Category::where('id', $categoryId)
            ->where('branch_id', $branchId)
            ->exists();

        if (!$belongs) {
            throw ValidationException::withMessages([
                'category_id' => ['La categoría seleccionada no pertenece a esta sucursal.'],
            ]);
        }
    }

    /**
     * Igual que authorizeBranchAccess() del trait, pero para operaciones en
     * lote (reorder): verifica que NINGUNO de los ids pertenezca a una
     * sucursal distinta a la del usuario. Se rechaza el lote completo ante
     * cualquier id ajeno, en vez de aplicar parcialmente el reorder.
     *
     * @param class-string<Category|Product> $modelClass
     */
    private function authorizeBranchOwnershipOfIds(User $user, string $modelClass, array $ids): ?JsonResponse
    {
        if ($user->isAdmin()) {
            return null;
        }

        $hasForeignBranchItem = $modelClass::whereIn('id', $ids)
            ->where('branch_id', '!=', $user->branch_id)
            ->exists();

        if ($hasForeignBranchItem) {
            return response()->json([
                'status' => false,
                'message' => 'No tienes permiso para modificar recursos de otra sucursal.',
            ], 403);
        }

        return null;
    }
}