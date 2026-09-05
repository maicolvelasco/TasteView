<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\AuthorizesBranchAccess;
use App\Http\Controllers\Controller;
use App\Http\Requests\Reservation\AvailableTablesRequest;
use App\Http\Requests\Reservation\StoreReservationRequest;
use App\Models\Reservation;
use App\Models\RestaurantTable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class ReservationController extends Controller
{
    use AuthorizesBranchAccess;

    private const ACTIVE_STATUSES = ['pending', 'confirmed'];
    private const ALL_STATUSES = ['pending', 'confirmed', 'seated', 'cancelled', 'no_show'];

    /**
     * Listado de reservas.
     * GET /api/reservations
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $filters = $request->validate([
            'branch_id' => ['sometimes', 'integer', 'exists:branches,id'],
            'date' => ['sometimes', 'date_format:Y-m-d'],
            'status' => ['sometimes', Rule::in(self::ALL_STATUSES)],
        ]);

        $branchId = $this->resolveBranchId($user, $filters['branch_id'] ?? null);
        if ($branchId instanceof JsonResponse) {
            return $branchId;
        }

        $query = Reservation::with('table')->where('branch_id', $branchId);

        if (isset($filters['date'])) {
            $query->whereDate('reservation_date', $filters['date']);
        }
        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        $reservations = $query->orderBy('reservation_date')
            ->orderBy('reservation_time')
            ->get();

        return response()->json([
            'status' => true,
            'data' => $reservations,
        ]);
    }

    /**
     * Crear una reserva.
     * POST /api/reservations
     */
    public function store(StoreReservationRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $user = $request->user();

        if ($response = $this->authorizeBranchAccess($user, $validated['branch_id'])) {
            return $response;
        }

        return DB::transaction(function () use ($validated) {
            if (!empty($validated['table_id'])) {
                // lockForUpdate: si dos personas reservan la misma mesa casi
                // al mismo tiempo, la segunda espera a que la primera
                // termine en vez de que ambas pasen la verificación de
                // disponibilidad y se pisen (doble reserva).
                $table = RestaurantTable::where('id', $validated['table_id'])
                    ->lockForUpdate()
                    ->firstOrFail();

                $this->assertTableUsableForReservation($table, $validated);

                if ($this->hasConflictingReservation($table->id, $validated['reservation_date'], $validated['reservation_time'])) {
                    return response()->json([
                        'status' => false,
                        'message' => 'La mesa ya tiene una reserva en ese horario',
                    ], 422);
                }
            }

            $reservation = Reservation::create($validated);

            return response()->json([
                'status' => true,
                'message' => 'Reserva creada exitosamente',
                'data' => $reservation->load('table'),
            ], 201);
        });
    }

    /**
     * Actualizar el estado de una reserva.
     * PATCH /api/reservations/{id}/status
     */
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', Rule::in(self::ALL_STATUSES)],
        ]);

        $reservation = Reservation::findOrFail($id);
        $user = $request->user();

        if ($response = $this->authorizeBranchAccess($user, $reservation->branch_id)) {
            return $response;
        }

        return DB::transaction(function () use ($reservation, $validated) {
            $updateData = ['status' => $validated['status']];

            if ($validated['status'] === 'confirmed') {
                $updateData['confirmed_at'] = now();
            }

            if ($validated['status'] === 'seated') {
                $updateData['seated_at'] = now();

                if ($reservation->table_id) {
                    RestaurantTable::where('id', $reservation->table_id)->update(['status' => 'occupied']);
                }
            }

            $reservation->update($updateData);

            return response()->json([
                'status' => true,
                'message' => 'Estado actualizado',
                'data' => $reservation,
            ]);
        });
    }

    /**
     * Mesas disponibles para una fecha/hora/cantidad de comensales dada.
     * GET /api/reservations/available-tables
     */
    public function availableTables(AvailableTablesRequest $request): JsonResponse
    {
        $validated = $request->validated();
        // branch_id llega como string desde el query string y la regla de
        // validación no lo castea (solo valida 'exists:branches,id'), pero
        // reservedTableIds() exige int en su firma. Lo normalizamos acá,
        // una sola vez, en vez de castear en cada uso.
        $validated['branch_id'] = (int) $validated['branch_id'];
        $user = $request->user();

        if ($response = $this->authorizeBranchAccess($user, $validated['branch_id'])) {
            return $response;
        }

        $reservedTableIds = $this->reservedTableIds(
            $validated['branch_id'],
            $validated['date'],
            $validated['time']
        );

        $tables = RestaurantTable::where('branch_id', $validated['branch_id'])
            ->where('is_active', true)
            ->where('capacity', '>=', $validated['guests'])
            ->whereNotIn('id', $reservedTableIds)
            ->where('status', 'free')
            ->get();

        return response()->json([
            'status' => true,
            'data' => $tables,
        ]);
    }

    // ==================== Helpers privados ====================

    /**
     * La mesa elegida debe pertenecer a la misma sucursal de la reserva y
     * tener capacidad suficiente para la cantidad de comensales. Antes
     * ninguno de los dos se validaba: se podía reservar una mesa de 2
     * personas para un grupo de 10, o una mesa de otra sucursal.
     */
    private function assertTableUsableForReservation(RestaurantTable $table, array $validated): void
    {
        if ($table->branch_id !== $validated['branch_id']) {
            throw ValidationException::withMessages([
                'table_id' => ['La mesa seleccionada no pertenece a esta sucursal.'],
            ]);
        }

        if ($table->capacity < $validated['guests_count']) {
            throw ValidationException::withMessages([
                'table_id' => ["La mesa no tiene capacidad para {$validated['guests_count']} comensales."],
            ]);
        }
    }

    /**
     * ¿Ya hay una reserva activa (pending/confirmed) para esa mesa dentro
     * de la ventana horaria de conflicto?
     */
    private function hasConflictingReservation(int $tableId, string $date, string $time): bool
    {
        [$from, $to] = $this->conflictWindow($time);

        return Reservation::where('table_id', $tableId)
            ->where('reservation_date', $date)
            ->whereIn('status', self::ACTIVE_STATUSES)
            ->whereTime('reservation_time', '>=', $from)
            ->whereTime('reservation_time', '<=', $to)
            ->exists();
    }

    /**
     * IDs de mesa con una reserva activa que se superpone a la ventana
     * horaria dada, dentro de una sucursal.
     */
    private function reservedTableIds(int $branchId, string $date, string $time): Collection
    {
        [$from, $to] = $this->conflictWindow($time);

        return Reservation::where('branch_id', $branchId)
            ->where('reservation_date', $date)
            ->whereIn('status', self::ACTIVE_STATUSES)
            ->whereTime('reservation_time', '>=', $from)
            ->whereTime('reservation_time', '<=', $to)
            ->pluck('table_id');
    }

    /**
     * Ventana de +/-2 horas alrededor de un horario, usada como margen
     * mínimo entre reservas de una misma mesa.
     *
     * NOTA: la comparación es por hora-del-día, no por fecha+hora completa.
     * Una reserva pedida muy cerca de la medianoche (ej. 23:30) puede no
     * comparar correctamente contra una reserva de la madrugada del día
     * siguiente. Es un caso límite poco común con horario normal de
     * restaurante; si operás cerca de medianoche o 24h, avisame y lo
     * resolvemos comparando fecha+hora completas en vez de solo la hora.
     *
     * @return array{0: string, 1: string}
     */
    private function conflictWindow(string $time): array
    {
        $base = Carbon::createFromFormat('H:i', $time);

        return [
            $base->copy()->subHours(2)->format('H:i'),
            $base->copy()->addHours(2)->format('H:i'),
        ];
    }
}