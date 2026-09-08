<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\Concerns\ApiResponse;
use App\Http\Controllers\Api\Concerns\AuthorizesCompanyAccess;
use App\Http\Controllers\Api\Concerns\NormalizesNames;
use App\Http\Controllers\Controller;
use App\Http\Requests\Branch\IndexBranchRequest;
use App\Http\Requests\Branch\StoreBranchRequest;
use App\Http\Requests\Branch\UpdateBranchRequest;
use App\Http\Resources\BranchResource;
use App\Models\Branch;
use App\Models\Category;
use App\Models\Modifier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Administración de sucursales (Branches).
 *
 * Reglas de acceso (multi-tenant):
 *  - Super Admin: ve y administra las sucursales de cualquier empresa.
 *  - Admin: ve y administra únicamente las sucursales de su propia
 *    empresa (la de su propia sucursal). No puede ver, editar ni crear
 *    sucursales de otra empresa, ni mover una sucursal a otra empresa.
 *  - Eliminar, restaurar o listar la papelera de sucursales está
 *    reservado al Super Admin: es una operación estructural que afecta
 *    a todo el negocio, no una tarea diaria de administración local.
 */
class BranchController extends Controller
{
    use ApiResponse, AuthorizesCompanyAccess, NormalizesNames;

    /**
     * Relaciones a contar para dar contexto útil en el listado/detalle
     * (cuántos usuarios, productos, mesas y pedidos tiene cada sucursal),
     * sin necesidad de cargar esos registros completos.
     */
    private const COUNTS = ['users', 'products', 'restaurantTables', 'orders'];

    /**
     * GET /api/branches
     * Listado de sucursales, con búsqueda y filtros. Un Admin normal
     * solo ve las de su propia empresa; el Super Admin ve todas (o las
     * de la empresa que indique por query param).
     */
    public function index(IndexBranchRequest $request): JsonResponse
    {
        $user = $request->user();

        $query = Branch::query()
            ->with('company')
            ->withCount(self::COUNTS);

        if ($user->isSuperAdmin()) {
            if ($request->filled('company_id')) {
                $query->where('company_id', $request->integer('company_id'));
            }

            if ($request->boolean('with_trashed')) {
                $query->withTrashed();
            }
        } else {
            // Aislamiento multi-tenant: un admin normal jamás ve
            // sucursales de una empresa que no es la suya.
            $query->where('company_id', $this->companyIdFor($user));
        }

        if ($request->filled('search')) {
            $term = '%' . $request->string('search')->trim() . '%';
            $query->where(function ($q) use ($term) {
                $q->where('name', 'like', $term)
                    ->orWhere('code', 'like', $term);
            });
        }

        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        $branches = $query->orderBy('name')->get();

        return $this->ok(BranchResource::collection($branches));
    }

    /**
     * GET /api/branches/{id}
     * Detalle de una sucursal puntual, con sus contadores.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $branch = Branch::with('company')->withCount(self::COUNTS)->findOrFail($id);

        if ($response = $this->authorizeCompanyAccess($request->user(), $branch->company_id)) {
            return $response;
        }

        return $this->ok(new BranchResource($branch));
    }

    /**
     * POST /api/branches
     * Crea una sucursal nueva dentro de la empresa del usuario (o, si
     * quien la crea es Super Admin, dentro de la empresa que indique).
     *
     * Como toda sucursal nace vacía, automáticamente se le copian las
     * categorías y modificadores que YA existen en las demás sucursales
     * de la misma empresa (sin duplicados por nombre) — ver
     * seedCategoriesAndModifiersFromSiblings(). Así el admin no tiene
     * que rearmar desde cero algo que ya configuró en otro local.
     */
    public function store(StoreBranchRequest $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->validated();

        $companyId = $user->isSuperAdmin()
            ? ($data['company_id'] ?? $this->companyIdFor($user))
            : $this->companyIdFor($user);

        if (! $companyId) {
            return $this->fail('No se pudo determinar la empresa para la nueva sucursal.', 422);
        }

        unset($data['company_id']);

        $data['settings'] = array_merge([
            'receipt_header' => $data['name'],
            'receipt_footer' => '¡Gracias por su preferencia!',
        ], $data['settings'] ?? []);

        $branch = Branch::create([...$data, 'company_id' => $companyId]);

        $seeded = $this->seedCategoriesAndModifiersFromSiblings($branch);

        return $this->ok([
            'branch' => new BranchResource($branch->load('company')),
            'seeded' => $seeded,
        ], 201);
    }

    /**
     * Copia hacia una sucursal recién creada las categorías y
     * modificadores (con sus opciones) que ya existen en las DEMÁS
     * sucursales de la MISMA EMPRESA, sin traer productos — eso lo
     * resuelve, a propósito, el botón "Duplicar de otra sucursal" del
     * panel de Menú, donde el admin elige puntualmente cuáles quiere y
     * con qué imagen/precio/AR. Acá solo se trae la ESTRUCTURA
     * reutilizable, automáticamente, al momento de crear la sucursal.
     *
     * Deduplica por nombre (sin importar mayúsculas/espacios, igual que
     * al duplicar platos): si tres sucursales ya tienen "Bebidas", la
     * nueva sucursal recibe UNA sola "Bebidas", no tres. Si es la
     * primera sucursal de la empresa, no hay nada que copiar.
     *
     * @return array{categories: int, modifiers: int} cuántas se copiaron, para informar al admin.
     */
    private function seedCategoriesAndModifiersFromSiblings(Branch $branch): array
    {
        $siblingBranchIds = Branch::where('company_id', $branch->company_id)
            ->where('id', '!=', $branch->id)
            ->pluck('id');

        if ($siblingBranchIds->isEmpty()) {
            return ['categories' => 0, 'modifiers' => 0];
        }

        $categoriesCreated = 0;
        $modifiersCreated = 0;

        DB::transaction(function () use ($siblingBranchIds, $branch, &$categoriesCreated, &$modifiersCreated) {
            // ---- Categorías ----
            $seenCategoryNames = [];

            Category::whereIn('branch_id', $siblingBranchIds)
                ->orderBy('branch_id')
                ->orderBy('sort_order')
                ->get()
                ->each(function (Category $category) use ($branch, &$seenCategoryNames, &$categoriesCreated) {
                    $key = $this->normalizeName($category->name);
                    if (isset($seenCategoryNames[$key])) {
                        return; // ya se copió una categoría con este nombre
                    }
                    $seenCategoryNames[$key] = true;

                    $copy = $category->replicate(['slug']);
                    $copy->branch_id = $branch->id;
                    // La sucursal es nueva y todavía no tiene categorías,
                    // así que el slug original no puede chocar con nada
                    // (unique(['branch_id','slug']) es por sucursal).
                    $copy->slug = Str::slug($category->name);
                    $copy->save();
                    $categoriesCreated++;
                });

            // ---- Modificadores (con sus opciones) ----
            $seenModifierNames = [];

            Modifier::whereIn('branch_id', $siblingBranchIds)
                ->with('options')
                ->orderBy('branch_id')
                ->get()
                ->each(function (Modifier $modifier) use ($branch, &$seenModifierNames, &$modifiersCreated) {
                    $key = $this->normalizeName($modifier->name);
                    if (isset($seenModifierNames[$key])) {
                        return;
                    }
                    $seenModifierNames[$key] = true;

                    $modifierCopy = $modifier->replicate();
                    $modifierCopy->branch_id = $branch->id;
                    $modifierCopy->save();

                    foreach ($modifier->options as $option) {
                        $optionCopy = $option->replicate();
                        $optionCopy->modifier_id = $modifierCopy->id;
                        $optionCopy->save();
                    }

                    $modifiersCreated++;
                });
        });

        return ['categories' => $categoriesCreated, 'modifiers' => $modifiersCreated];
    }

    /**
     * PUT /api/branches/{id}
     * Actualiza una sucursal existente. Un admin normal solo puede
     * tocar sucursales de su propia empresa, y nunca puede reasignarla
     * a otra empresa (ese campo se descarta salvo que sea Super Admin).
     */
    public function update(UpdateBranchRequest $request, int $id): JsonResponse
    {
        $branch = Branch::findOrFail($id);
        $user = $request->user();

        if ($response = $this->authorizeCompanyAccess($user, $branch->company_id)) {
            return $response;
        }

        $data = $request->validated();

        if (! $user->isSuperAdmin()) {
            unset($data['company_id']);
        }

        if (array_key_exists('settings', $data) && is_array($data['settings'])) {
            // Merge en vez de reemplazo total: así el frontend puede
            // mandar solo el campo de settings que cambió sin borrar
            // el resto de la configuración de la sucursal.
            $data['settings'] = array_merge($branch->settings ?? [], $data['settings']);
        }

        $branch->update($data);

        return $this->ok(new BranchResource($branch->fresh(['company'])->loadCount(self::COUNTS)));
    }

    /**
     * DELETE /api/branches/{id}
     * Elimina (soft delete) una sucursal. Reservado a Super Admin y
     * bloqueado si todavía tiene usuarios o pedidos asociados, para no
     * dejar datos huérfanos colgando de una sucursal "eliminada".
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        if (! $request->user()->isSuperAdmin()) {
            return $this->fail('Solo un Super Admin puede eliminar sucursales.', 403);
        }

        $branch = Branch::findOrFail($id);

        if ($branch->users()->exists()) {
            return $this->fail('No puedes eliminar una sucursal con usuarios asignados. Reasígnalos o elimínalos primero.', 409);
        }

        if ($branch->orders()->exists()) {
            return $this->fail('No puedes eliminar una sucursal con pedidos registrados.', 409);
        }

        $branch->delete();

        return $this->okMessage('Sucursal eliminada');
    }

    /**
     * POST /api/branches/{id}/restore
     * Restaura una sucursal previamente eliminada. Reservado a Super Admin.
     */
    public function restore(Request $request, int $id): JsonResponse
    {
        if (! $request->user()->isSuperAdmin()) {
            return $this->fail('Solo un Super Admin puede restaurar sucursales.', 403);
        }

        $branch = Branch::withTrashed()->findOrFail($id);
        $branch->restore();

        return $this->ok(new BranchResource($branch->load('company')));
    }

    /**
     * GET /api/branches/trashed
     * Lista las sucursales eliminadas (papelera). Reservado a Super Admin.
     */
    public function trashed(Request $request): JsonResponse
    {
        if (! $request->user()->isSuperAdmin()) {
            return $this->fail('Solo un Super Admin puede ver la papelera de sucursales.', 403);
        }

        $branches = Branch::onlyTrashed()->with('company')->orderByDesc('deleted_at')->get();

        return $this->ok(BranchResource::collection($branches));
    }
}
