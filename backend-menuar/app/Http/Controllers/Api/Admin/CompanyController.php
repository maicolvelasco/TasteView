<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\Concerns\ApiResponse;
use App\Http\Controllers\Api\Concerns\AuthorizesCompanyAccess;
use App\Http\Controllers\Controller;
use App\Http\Requests\Company\UpdateCompanyRequest;
use App\Models\Company;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Ajustes del negocio (pestaña "Negocio" del panel de Ajustes): nombre y
 * logo que se muestran en el panel de administración y en el menú
 * público, en vez del branding genérico ("🍽️ Restaurant AR") por
 * defecto del proyecto.
 *
 * Es información a nivel EMPRESA (Company), no de una sucursal puntual
 * —una cadena con varias sucursales comparte un solo logo/nombre de
 * marca— por eso vive acá y no en BranchController. Reglas de acceso:
 * mismas que Sucursales (ver AuthorizesCompanyAccess): un Admin normal
 * solo ve/edita la empresa de su propia sucursal; el Super Admin puede
 * indicar `?company_id=` para administrar la de cualquier empresa.
 */
class CompanyController extends Controller
{
    use ApiResponse, AuthorizesCompanyAccess;

    /**
     * GET /api/company
     */
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();
        $companyId = $this->resolveCompanyId($request);

        if (! $companyId) {
            return $this->fail('Tu usuario no tiene una empresa asociada.', 422);
        }

        if ($response = $this->authorizeCompanyAccess($user, $companyId)) {
            return $response;
        }

        $company = Company::findOrFail($companyId);

        return $this->ok($this->present($company));
    }

    /**
     * PUT /api/company
     */
    public function update(UpdateCompanyRequest $request): JsonResponse
    {
        $user = $request->user();
        $companyId = $this->resolveCompanyId($request);

        if (! $companyId) {
            return $this->fail('Tu usuario no tiene una empresa asociada.', 422);
        }

        if ($response = $this->authorizeCompanyAccess($user, $companyId)) {
            return $response;
        }

        $company = Company::findOrFail($companyId);
        $company->update($request->validated());

        return $this->ok($this->present($company));
    }

    /**
     * Un Admin normal siempre administra la empresa de su propia
     * sucursal; solo el Super Admin puede apuntar a otra con
     * `?company_id=` (por ejemplo, para dar soporte a un cliente).
     */
    private function resolveCompanyId(Request $request): ?int
    {
        $user = $request->user();

        if ($user->isSuperAdmin() && $request->filled('company_id')) {
            return $request->integer('company_id');
        }

        return $this->companyIdFor($user);
    }

    private function present(Company $company): array
    {
        return [
            'id' => $company->id,
            'name' => $company->name,
            'logo_url' => $company->logo_url,
            // Si el negocio todavía no configuró colores propios, se manda
            // el tema por defecto del proyecto (mismo naranja de siempre)
            // para que el frontend siempre reciba una forma predecible y
            // no tenga que adivinar valores por su cuenta.
            'theme' => $company->theme ?? [
                'mode' => 'solid',
                'primary' => '#E67E22',
                'secondary' => null,
                'font' => 'inter',
            ],
        ];
    }
}
