<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\Concerns\ApiResponse;
use App\Http\Controllers\Api\Concerns\AuthorizesBranchAccess;
use App\Http\Controllers\Controller;
use App\Http\Requests\Modifier\StoreModifierRequest;
use App\Models\Modifier;
use App\Models\ModifierOption;
use App\Models\Product;
use App\Models\ProductModifier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ModifierController extends Controller
{
    use ApiResponse, AuthorizesBranchAccess;

    /**
     * Listar modificadores (grupos de opciones) de la sucursal
     * GET /api/modifiers
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $modifiers = Modifier::where('branch_id', $user->branch_id)
            ->with(['options' => fn($q) => $q->orderBy('sort_order')])
            ->orderBy('name')
            ->get();

        return $this->ok($modifiers);
    }

    /**
     * POST /api/modifiers
     *
     * Antes esta ruta confiaba ciegamente en el `branch_id` que mandara
     * el cliente, sin verificar que perteneciera al usuario — cualquiera
     * podía crear un modificador en una sucursal ajena con solo cambiar
     * ese valor en la petición. Ahora se valida con el mismo trait que
     * usa el resto del panel (`AuthorizesBranchAccess`): un Admin puede
     * crear en cualquier sucursal, cualquier otro rol solo en la suya.
     */
    public function store(StoreModifierRequest $request): JsonResponse
    {
        $validated = $request->validated();

        if ($response = $this->authorizeBranchAccess($request->user(), $validated['branch_id'])) {
            return $response;
        }

        $modifier = Modifier::create([
            'branch_id' => $validated['branch_id'],
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'min_selections' => $validated['min_selections'] ?? 0,
            'max_selections' => $validated['max_selections'] ?? 1,
        ]);

        foreach ($validated['options'] as $opt) {
            ModifierOption::create([
                'modifier_id' => $modifier->id,
                'name' => $opt['name'],
                'price_adjustment' => $opt['price_adjustment'] ?? 0,
            ]);
        }

        return $this->ok($modifier->load('options'), 201);
    }

    /**
     * Editar un grupo de opciones (nombre, descripción, mín/máx selecciones)
     * PUT /api/modifiers/{id}
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $modifier = Modifier::findOrFail($id);

        if ($response = $this->authorizeBranchAccess($request->user(), $modifier->branch_id)) {
            return $response;
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:100',
            'description' => 'nullable|string',
            'min_selections' => 'nullable|integer|min:0',
            'max_selections' => 'nullable|integer|min:1',
        ]);

        $modifier->update($validated);

        return $this->ok($modifier->load('options'));
    }

    /**
     * Eliminar un grupo de modificador (y sus opciones/asignaciones en cascada)
     * DELETE /api/modifiers/{id}
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $modifier = Modifier::findOrFail($id);

        if ($response = $this->authorizeBranchAccess($request->user(), $modifier->branch_id)) {
            return $response;
        }

        $productIds = ProductModifier::where('modifier_id', $id)->pluck('product_id');

        // Quitar la asignación a todos los productos que lo usaban
        ProductModifier::where('modifier_id', $id)->delete();
        $modifier->delete();

        // Si algún producto se quedó sin modificadores, actualizar el flag
        foreach ($productIds as $productId) {
            $remaining = ProductModifier::where('product_id', $productId)->count();
            if ($remaining === 0) {
                Product::where('id', $productId)->update(['has_modifiers' => false]);
            }
        }

        return $this->okMessage('Modificador eliminado');
    }

    /**
     * Agregar una opción nueva a un grupo existente
     * POST /api/modifiers/{modifierId}/options
     */
    public function storeOption(Request $request, int $modifierId): JsonResponse
    {
        $modifier = Modifier::findOrFail($modifierId);

        if ($response = $this->authorizeBranchAccess($request->user(), $modifier->branch_id)) {
            return $response;
        }

        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'price_adjustment' => 'nullable|numeric',
        ]);

        $option = ModifierOption::create([
            'modifier_id' => $modifier->id,
            'name' => $validated['name'],
            'price_adjustment' => $validated['price_adjustment'] ?? 0,
        ]);

        return $this->ok($option, 201);
    }

    /**
     * Editar una opción puntual (nombre / precio)
     * PUT /api/modifier-options/{id}
     */
    public function updateOption(Request $request, int $id): JsonResponse
    {
        $option = ModifierOption::with('modifier')->findOrFail($id);

        if ($response = $this->authorizeBranchAccess($request->user(), $option->modifier->branch_id)) {
            return $response;
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:100',
            'price_adjustment' => 'sometimes|numeric',
            'is_active' => 'sometimes|boolean',
        ]);

        $option->update($validated);

        return $this->ok($option);
    }

    /**
     * Eliminar una opción puntual de un grupo (ej: quitar "Con leche de soya")
     * DELETE /api/modifier-options/{id}
     */
    public function destroyOption(Request $request, int $id): JsonResponse
    {
        $option = ModifierOption::with('modifier')->findOrFail($id);

        if ($response = $this->authorizeBranchAccess($request->user(), $option->modifier->branch_id)) {
            return $response;
        }

        $option->delete();

        return $this->okMessage('Opción eliminada');
    }
}
