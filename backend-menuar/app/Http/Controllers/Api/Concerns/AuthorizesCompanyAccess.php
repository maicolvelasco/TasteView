<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\Concerns;

use App\Models\User;
use Illuminate\Http\JsonResponse;

/**
 * Verifica que un usuario tenga permiso para operar sobre una sucursal
 * perteneciente a una empresa (company) determinada: el Super Admin
 * puede acceder a cualquier empresa; un Admin normal solo a la suya
 * propia (la de su propia sucursal). Es el equivalente, a nivel de
 * empresa, de AuthorizesBranchAccess (que trabaja a nivel de sucursal
 * para pedidos, facturas, etc).
 *
 * Devuelve una JsonResponse (403) cuando NO tiene permiso, o null cuando
 * sí lo tiene — así el controller puede hacer:
 *
 *   if ($response = $this->authorizeCompanyAccess($user, $branch->company_id)) {
 *       return $response;
 *   }
 */
trait AuthorizesCompanyAccess
{
    protected function authorizeCompanyAccess(User $user, int|string|null $companyId): ?JsonResponse
    {
        // $companyId puede llegar como string si en algún punto viene de
        // un query param; se normaliza para que la comparación estricta
        // de abajo no falle por diferencia de tipos.
        $companyId = $companyId !== null ? (int) $companyId : null;

        if ($user->isSuperAdmin() || $this->companyIdFor($user) === $companyId) {
            return null;
        }

        return response()->json([
            'status' => false,
            'message' => 'No tienes permiso para acceder a esta sucursal.',
        ], 403);
    }

    /**
     * Empresa a la que pertenece el usuario, resuelta a través de su
     * propia sucursal (un usuario no-superadmin siempre pertenece a
     * exactamente una sucursal, y por tanto a una sola empresa).
     */
    protected function companyIdFor(User $user): ?int
    {
        return $user->branch?->company_id;
    }
}
