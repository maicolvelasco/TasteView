<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\Concerns\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\RestaurantTable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    use ApiResponse;

    /**
     * GET /api/dashboard
     */
    public function index(Request $request): JsonResponse
    {
        $branchId = $request->user()->branch_id;

        return $this->ok([
            'today_orders' => Order::where('branch_id', $branchId)->today()->count(),
            'today_sales' => (float) Invoice::where('branch_id', $branchId)->today()->sum('total'),
            'active_orders' => Order::where('branch_id', $branchId)->active()->count(),
            'pending_items' => OrderItem::whereHas('order', fn($q) => $q->where('branch_id', $branchId))->pending()->count(),
            'free_tables' => RestaurantTable::where('branch_id', $branchId)->free()->count(),
            'occupied_tables' => RestaurantTable::where('branch_id', $branchId)->where('status', 'occupied')->count(),
        ]);
    }
}