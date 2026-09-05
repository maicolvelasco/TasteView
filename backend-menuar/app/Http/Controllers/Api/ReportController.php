<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Enums\InvoiceStatus;
use App\Enums\PaymentStatus;
use App\Http\Controllers\Api\Concerns\AuthorizesBranchAccess;
use App\Http\Controllers\Controller;
use App\Http\Requests\Report\SalesReportRequest;
use App\Models\Invoice;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    use AuthorizesBranchAccess;

    /**
     * Serie de ventas agrupada por período.
     * GET /api/reports/sales
     */
    public function sales(SalesReportRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $branchId = $this->resolveBranchId($request->user(), $validated['branch_id'] ?? null);
        if ($branchId instanceof JsonResponse) {
            return $branchId;
        }

        [$startDate, $dateFormat] = $this->resolvePeriodRange($validated['period'] ?? 'week');

        $sales = Invoice::where('branch_id', $branchId)
            ->where('status', InvoiceStatus::FINALIZED->value)
            ->where('created_at', '>=', $startDate)
            ->select(
                // $dateFormat solo puede ser uno de los 4 literales fijos
                // definidos en resolvePeriodRange() — nunca llega acá
                // directamente lo que el usuario mandó en "period", así
                // que interpolarlo en el raw SQL es seguro.
                DB::raw("DATE_FORMAT(created_at, '{$dateFormat}') as label"),
                DB::raw('SUM(total) as total'),
                DB::raw('COUNT(*) as count')
            )
            ->groupBy('label')
            ->orderBy('label')
            ->get();

        return response()->json([
            'status' => true,
            'data' => $sales,
        ]);
    }

    /**
     * Productos más vendidos.
     * GET /api/reports/top-products
     */
    public function topProducts(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'branch_id' => ['sometimes', 'integer', 'exists:branches,id'],
            'limit' => ['sometimes', 'integer', 'min:1', 'max:50'],
        ]);

        $branchId = $this->resolveBranchId($request->user(), $validated['branch_id'] ?? null);
        if ($branchId instanceof JsonResponse) {
            return $branchId;
        }

        $limit = $validated['limit'] ?? 10;

        $products = OrderItem::join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->where('orders.branch_id', $branchId)
            ->where('orders.payment_status', PaymentStatus::PAID->value)
            ->select(
                'products.id',
                'products.name',
                'products.image_url',
                DB::raw('SUM(order_items.quantity) as total_sold'),
                DB::raw('SUM(order_items.subtotal) as total_revenue')
            )
            ->groupBy('products.id', 'products.name', 'products.image_url')
            ->orderByDesc('total_sold')
            ->limit($limit)
            ->get();

        return response()->json([
            'status' => true,
            'data' => $products,
        ]);
    }

    /**
     * Resumen para el dashboard (ventas de hoy/semana/mes + ticket promedio).
     * GET /api/reports/summary
     */
    public function summary(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'branch_id' => ['sometimes', 'integer', 'exists:branches,id'],
        ]);

        $branchId = $this->resolveBranchId($request->user(), $validated['branch_id'] ?? null);
        if ($branchId instanceof JsonResponse) {
            return $branchId;
        }

        $today = now()->startOfDay();
        $weekStart = now()->subDays(7)->startOfDay();
        $monthStart = now()->subDays(30)->startOfDay();

        $todaySales = $this->finalizedInvoices($branchId)->whereDate('created_at', $today)->sum('total');
        $weekSales = $this->finalizedInvoices($branchId)->where('created_at', '>=', $weekStart)->sum('total');
        $monthSales = $this->finalizedInvoices($branchId)->where('created_at', '>=', $monthStart)->sum('total');
        $avgTicket = $this->finalizedInvoices($branchId)->where('created_at', '>=', $weekStart)->avg('total') ?? 0;

        $todayOrders = Order::where('branch_id', $branchId)
            ->whereDate('created_at', $today)
            ->count();

        return response()->json([
            'status' => true,
            'data' => [
                'today_sales' => (float) $todaySales,
                'week_sales' => (float) $weekSales,
                'month_sales' => (float) $monthSales,
                'today_orders' => $todayOrders,
                'avg_ticket' => round((float) $avgTicket, 2),
            ],
        ]);
    }

    // ==================== Helpers privados ====================

    /**
     * Determina qué sucursal reportar: la que se pida explícitamente
     * (solo permitido para admins, vía el trait) o la propia del usuario
     * por defecto. Antes los tres métodos estaban duros a la sucursal del
     * usuario, sin que un admin pudiera consultar el reporte de otra.
     */
    private function resolveBranchId(User $user, ?int $requestedBranchId): int|JsonResponse
    {
        $branchId = $requestedBranchId ?? $user->branch_id;

        if ($response = $this->authorizeBranchAccess($user, $branchId)) {
            return $response;
        }

        return $branchId;
    }

    /**
     * Query base de facturas finalizadas de una sucursal, reutilizada por
     * summary() para no repetir el mismo where() cuatro veces.
     */
    private function finalizedInvoices(int $branchId)
    {
        return Invoice::where('branch_id', $branchId)
            ->where('status', InvoiceStatus::FINALIZED->value);
    }

    /**
     * Resuelve la fecha de inicio y el formato de agrupación para cada
     * período soportado. $period ya viene validado contra una whitelist
     * fija (ver SalesReportRequest), así que no puede llegar cualquier cosa.
     *
     * @return array{0: Carbon, 1: string}
     */
    private function resolvePeriodRange(string $period): array
    {
        return match ($period) {
            'day' => [now()->startOfDay(), '%H:00'],
            'month' => [now()->subDays(30)->startOfDay(), '%Y-%m-%d'],
            'year' => [now()->subMonths(12)->startOfDay(), '%Y-%m'],
            default => [now()->subDays(7)->startOfDay(), '%Y-%m-%d'], // 'week'
        };
    }
}