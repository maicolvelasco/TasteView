<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\Concerns;

use App\Models\User;
use Illuminate\Http\JsonResponse;

/**
 * Verifica que un usuario tenga permiso para operar sobre un recurso de
 * una sucursal determinada: los admins pueden acceder a cualquiera, el
 * resto solo a la suya propia.
 *
 * Devuelve una JsonResponse (403) cuando NO tiene permiso, o null cuando
 * sí lo tiene — así el controller puede hacer:
 *
 *   if ($response = $this->authorizeBranchAccess($user, $order->branch_id)) {
 *       return $response;
 *   }
 */
trait AuthorizesBranchAccess
{
    protected function authorizeBranchAccess(User $user, int|string|null $branchId): ?JsonResponse
    {
        // $branchId puede llegar como string cuando viene de un query param
        // (?branch_id=1 en un GET), a diferencia de un body JSON donde ya
        // llega como int. Sin este cast, el "===" de abajo comparaba un int
        // (branch_id del usuario) contra un string y siempre daba false
        // (bloqueaba a cualquier no-admin), y con tipado estricto además
        // rompía con un TypeError si el parámetro del método fuera ?int.
        $branchId = $branchId !== null ? (int) $branchId : null;

        if ($user->isAdmin() || $user->branch_id === $branchId) {
            return null;
        }

        return response()->json([
            'status' => false,
            'message' => 'No tienes permiso para acceder a este recurso.',
        ], 403);
    }

    /**
     * Resuelve qué sucursal usar en un listado/reporte: la pedida
     * explícitamente por query param (solo permitido para admins, vía
     * authorizeBranchAccess) o la propia del usuario por defecto.
     *
     * Devuelve el ID de sucursal a usar, o una JsonResponse (403) si no
     * tiene permiso — el controller debe chequear con instanceof:
     *
     *   $branchId = $this->resolveBranchId($user, $filters['branch_id'] ?? null);
     *   if ($branchId instanceof JsonResponse) {
     *       return $branchId;
     *   }
     */
    protected function resolveBranchId(User $user, int|string|null $requestedBranchId): int|JsonResponse
    {
        $branchId = $requestedBranchId !== null ? (int) $requestedBranchId : $user->branch_id;

        if ($response = $this->authorizeBranchAccess($user, $branchId)) {
            return $response;
        }

        return $branchId;
    }
}