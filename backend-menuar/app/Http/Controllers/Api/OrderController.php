<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Enums\OrderItemStatus;
use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Http\Controllers\Api\Concerns\AuthorizesBranchAccess;
use App\Http\Controllers\Controller;
use App\Http\Requests\Order\StoreOrderRequest;
use App\Http\Requests\Order\UpdateOrderStatusRequest;
use App\Models\ModifierOption;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderItemModifier;
use App\Models\Product;
use App\Models\RestaurantTable;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class OrderController extends Controller
{
    use AuthorizesBranchAccess;

    /**
     * Crear un nuevo pedido.
     * POST /api/orders
     */
    public function store(StoreOrderRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $user = $request->user();

        if ($response = $this->authorizeBranchAccess($user, $validated['branch_id'])) {
            return $response;
        }

        return DB::transaction(function () use ($validated, $user) {
            // Una sola query para todos los productos del pedido (en vez de
            // una por item) y se valida de una que todos pertenezcan a la
            // sucursal del pedido — evita mezclar catálogos/precios de
            // otra sucursal.
            $products = $this->resolveProductsForItems($validated['items'], $validated['branch_id']);
            $modifierOptions = $this->resolveModifierOptionsForItems($validated['items']);

            if (!empty($validated['table_id'])) {
                $this->assertTableBelongsToBranch($validated['table_id'], $validated['branch_id']);
            }

            $assignedUserId = $this->resolveAssignedUser($user, $validated);

            $order = Order::create([
                'branch_id' => $validated['branch_id'],
                'table_id' => $validated['table_id'] ?? null,
                'user_id' => $assignedUserId,
                'customer_name' => $validated['customer_name'] ?? null,
                'customer_phone' => $validated['customer_phone'] ?? null,
                'order_type' => $validated['order_type'],
                'guests_count' => $validated['guests_count'] ?? 1,
                'notes' => $validated['notes'] ?? null,
                'status' => OrderStatus::PENDING,
                'payment_status' => PaymentStatus::PENDING,
            ]);

            $this->createOrderItems($order, $validated['items'], $products, $modifierOptions);

            $order->recalculateTotals();

            if ($order->table_id) {
                RestaurantTable::where('id', $order->table_id)->update(['status' => 'occupied']);
            }

            return response()->json([
                'status' => true,
                'message' => 'Pedido creado exitosamente',
                'data' => $order->load('items.product', 'items.modifiers'),
            ], 201);
        });
    }

    /**
     * Listar pedidos (con filtros por rol).
     * GET /api/orders
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $filters = $request->validate([
            'status' => ['sometimes', Rule::in(array_column(OrderStatus::cases(), 'value'))],
            'date' => ['sometimes', 'date_format:Y-m-d'],
            'table_id' => ['sometimes', 'integer'],
        ]);

        $query = Order::with(['items.product', 'items.modifiers', 'table', 'user', 'invoice'])
            ->where('branch_id', $user->branch_id);

        // Mesero solo ve sus pedidos.
        if ($user->isWaiter()) {
            $query->where('user_id', $user->id);
        }

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }
        if (isset($filters['date'])) {
            $query->whereDate('created_at', $filters['date']);
        }
        if (isset($filters['table_id'])) {
            $query->where('table_id', $filters['table_id']);
        }

        $orders = $query->orderByDesc('created_at')->paginate(20);

        return response()->json([
            'status' => true,
            'data' => $orders,
        ]);
    }

    /**
     * Detalle de un pedido.
     * GET /api/orders/{id}
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $order = Order::with(['items.product', 'items.modifiers', 'items.chef', 'table', 'user', 'invoice'])
            ->findOrFail($id);

        if ($response = $this->authorizeBranchAccess($user, $order->branch_id)) {
            return $response;
        }

        if ($user->isWaiter() && $order->user_id !== $user->id) {
            return response()->json([
                'status' => false,
                'message' => 'No tienes permiso para ver este pedido',
            ], 403);
        }

        return response()->json([
            'status' => true,
            'data' => $order,
        ]);
    }

    /**
     * Actualizar estado general de un pedido.
     * PATCH /api/orders/{id}/status
     */
    public function updateStatus(UpdateOrderStatusRequest $request, int $id): JsonResponse
    {
        $validated = $request->validated();
        $user = $request->user();
        $order = Order::findOrFail($id);

        if ($response = $this->authorizeBranchAccess($user, $order->branch_id)) {
            return $response;
        }

        // Cocina solo visualiza los pedidos, no cambia su estado.
        if ($user->isChef()) {
            return response()->json([
                'status' => false,
                'message' => 'El personal de cocina solo puede visualizar los pedidos.',
            ], 403);
        }

        return $this->updateOrderStatus($order, $validated['status']);
    }

    /**
     * Actualiza el estado general del pedido.
     */
    private function updateOrderStatus(Order $order, string $status): JsonResponse
    {
        return DB::transaction(function () use ($order, $status) {
            $order->update(['status' => $status]);

            if ($status === OrderStatus::SERVED->value) {
                $order->items()->update([
                    'status' => OrderItemStatus::SERVED->value,
                    'served_at' => now(),
                ]);
            }

            return response()->json([
                'status' => true,
                'message' => 'Estado del pedido actualizado',
                'data' => $order->load('items'),
            ]);
        });
    }

    // ==================== Helpers privados ====================

    /**
     * Trae todos los productos de los items en una sola query y valida que
     * TODOS pertenezcan a la sucursal del pedido.
     */
    private function resolveProductsForItems(array $items, int $branchId): Collection
    {
        $productIds = collect($items)->pluck('product_id')->unique();
        $products = Product::whereIn('id', $productIds)->get()->keyBy('id');

        $foreign = $products->first(fn ($product) => $product->branch_id !== $branchId);

        if ($foreign) {
            throw ValidationException::withMessages([
                'items' => ["El producto «{$foreign->name}» no pertenece a esta sucursal."],
            ]);
        }

        return $products;
    }

    /**
     * Trae todas las opciones de modificador usadas en el pedido en una
     * sola query (en vez de una por cada modificador de cada item).
     */
    private function resolveModifierOptionsForItems(array $items): Collection
    {
        $optionIds = collect($items)
            ->flatMap(fn ($item) => collect($item['modifiers'] ?? [])->pluck('modifier_option_id'))
            ->unique();

        if ($optionIds->isEmpty()) {
            return collect();
        }

        return ModifierOption::with('modifier')->whereIn('id', $optionIds)->get()->keyBy('id');
    }

    /**
     * La mesa indicada debe pertenecer a la misma sucursal del pedido.
     */
    private function assertTableBelongsToBranch(int $tableId, int $branchId): void
    {
        $belongs = RestaurantTable::where('id', $tableId)->where('branch_id', $branchId)->exists();

        if (!$belongs) {
            throw ValidationException::withMessages([
                'table_id' => ['La mesa seleccionada no pertenece a esta sucursal.'],
            ]);
        }
    }

    /**
     * Resuelve a quién queda asignado el pedido. Por defecto a quien lo
     * crea; si el creador NO es mesero (cajero/gerente/admin tomando el
     * pedido por otro) puede asignarlo a un mesero puntual, pero se valida
     * que ese mesero exista, sea realmente mesero y sea de la misma
     * sucursal — antes se aceptaba cualquier user_id sin más chequeo.
     */
    private function resolveAssignedUser(?User $user, array $validated): ?int
    {
        if (empty($validated['waiter_id']) || !$user || $user->isWaiter()) {
            return $user?->id;
        }

        $waiter = User::find($validated['waiter_id']);

        if (!$waiter || !$waiter->isWaiter() || $waiter->branch_id !== $validated['branch_id']) {
            throw ValidationException::withMessages([
                'waiter_id' => ['El mesero indicado no es válido para esta sucursal.'],
            ]);
        }

        return $waiter->id;
    }

    /**
     * Crea los OrderItem de un pedido a partir de productos y opciones de
     * modificador ya resueltos en memoria (sin queries adicionales).
     */
    private function createOrderItems(Order $order, array $items, Collection $products, Collection $modifierOptions): void
    {
        foreach ($items as $itemData) {
            $product = $products->get($itemData['product_id']);
            $quantity = $itemData['quantity'];
            $unitPrice = $product->price;

            $orderItem = OrderItem::create([
                'order_id' => $order->id,
                'product_id' => $product->id,
                'quantity' => $quantity,
                'unit_price' => $unitPrice,
                'modifiers_total' => 0,
                'subtotal' => $unitPrice * $quantity,
                'notes' => $itemData['notes'] ?? null,
                'status' => OrderItemStatus::PENDING,
            ]);

            if (!empty($itemData['modifiers'])) {
                $modifiersTotal = $this->attachItemModifiers($orderItem, $itemData['modifiers'], $modifierOptions);

                $orderItem->update([
                    'modifiers_total' => $modifiersTotal,
                    'subtotal' => ($unitPrice * $quantity) + $modifiersTotal,
                ]);
            }
        }
    }

    /**
     * Crea los OrderItemModifier de un item y devuelve el total que suman.
     */
    private function attachItemModifiers(OrderItem $orderItem, array $modifiersData, Collection $modifierOptions): float
    {
        $modifiersTotal = 0;

        foreach ($modifiersData as $modData) {
            $option = $modifierOptions->get($modData['modifier_option_id']);
            $modQty = $modData['quantity'] ?? 1;
            $modPrice = $option->price_adjustment * $modQty;
            $modifiersTotal += $modPrice;

            OrderItemModifier::create([
                'order_item_id' => $orderItem->id,
                'modifier_option_id' => $option->id,
                'modifier_name' => $option->modifier->name,
                'option_name' => $option->name,
                'price_adjustment' => $option->price_adjustment,
                'quantity' => $modQty,
            ]);
        }

        return $modifiersTotal;
    }
}