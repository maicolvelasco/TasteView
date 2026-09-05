<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Table\StoreTableRequest;
use App\Http\Requests\Table\UpdateTableRequest;
use App\Models\RestaurantTable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class TableController extends Controller
{
    /**
     * Listar mesas de la sucursal (mesero/cajero la usan para armar pedidos).
     * GET /api/tables
     *
     * No recibe branch_id del cliente en ningún método de este controller
     * a propósito: siempre se usa la sucursal del usuario autenticado, así
     * que no hace falta autorización adicional por sucursal.
     */
    public function index(Request $request): JsonResponse
    {
        $tables = RestaurantTable::where('branch_id', $request->user()->branch_id)
            ->where('is_active', true)
            ->orderBy('number')
            ->get();

        return response()->json(['status' => true, 'data' => $tables]);
    }

    /**
     * Crear una mesa nueva.
     * POST /api/tables
     */
    public function store(StoreTableRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $branchId = $request->user()->branch_id;

        $table = RestaurantTable::create([
            'branch_id' => $branchId,
            'number' => $validated['number'],
            'name' => $validated['name'] ?? null,
            'capacity' => $validated['capacity'] ?? 4,
            'qr_code' => $this->generateQrCode($validated['number']),
            'status' => 'free',
            'is_active' => true,
        ]);

        return response()->json(['status' => true, 'data' => $table], 201);
    }

    /**
     * Editar una mesa (número, nombre, capacidad, estado).
     * PUT /api/tables/{id}
     */
    public function update(UpdateTableRequest $request, int $id): JsonResponse
    {
        $table = RestaurantTable::where('branch_id', $request->user()->branch_id)->findOrFail($id);

        $table->update($request->validated());

        return response()->json(['status' => true, 'data' => $table]);
    }

    /**
     * Eliminar (o desactivar) una mesa.
     * Si tiene pedidos asociados, se desactiva en vez de borrarla para no romper el historial.
     * DELETE /api/tables/{id}
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $table = RestaurantTable::where('branch_id', $request->user()->branch_id)->findOrFail($id);

        if ($table->orders()->exists()) {
            $table->update(['is_active' => false]);

            return response()->json([
                'status' => true,
                'message' => 'La mesa tiene pedidos en su historial, así que se desactivó en vez de eliminarse.',
            ]);
        }

        $table->delete();

        return response()->json(['status' => true, 'message' => 'Mesa eliminada']);
    }

    /**
     * Genera el código para el QR de la mesa.
     */
    private function generateQrCode(string $number): string
    {
        return 'TABLE-' . strtoupper(Str::random(8)) . '-' . $number;
    }
}