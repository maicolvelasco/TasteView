<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Enums\InvoiceStatus;
use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Http\Controllers\Api\Concerns\AuthorizesBranchAccess;
use App\Http\Controllers\Controller;
use App\Http\Requests\Invoice\CancelInvoiceRequest;
use App\Http\Requests\Invoice\IndexInvoiceRequest;
use App\Http\Requests\Invoice\StoreInvoiceRequest;
use App\Models\Invoice;
use App\Models\Order;
use App\Models\RestaurantTable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InvoiceController extends Controller
{
    use AuthorizesBranchAccess;

    /**
     * Crear factura desde un pedido.
     * POST /api/invoices
     */
    public function store(StoreInvoiceRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $user = $request->user();

        return DB::transaction(function () use ($validated, $user) {
            // lockForUpdate: si dos requests llegan casi al mismo tiempo para
            // el mismo pedido (doble clic, doble tap en el POS), el segundo
            // espera a que termine el primero en vez de correr en paralelo
            // y crear dos facturas para el mismo pedido.
            $order = Order::with('items')
                ->lockForUpdate()
                ->findOrFail($validated['order_id']);

            if ($response = $this->authorizeBranchAccess($user, $order->branch_id)) {
                return $response;
            }

            if ($this->orderAlreadyInvoiced($order)) {
                return response()->json([
                    'status' => false,
                    'message' => 'Este pedido ya tiene una factura vigente.',
                ], 422);
            }

            $amounts = $this->calculateAmounts($order, $validated['has_tax']);

            $invoice = Invoice::create([
                'branch_id' => $order->branch_id,
                'order_id' => $order->id,
                'user_id' => $user->id,
                'customer_name' => $validated['customer_name'] ?? $order->customer_name,
                'customer_nit' => $validated['customer_nit'] ?? null,
                'subtotal' => $amounts['subtotal'],
                'tax_amount' => $amounts['tax_amount'],
                'discount_amount' => $amounts['discount'],
                'total' => $amounts['total'],
                'has_tax' => $validated['has_tax'],
                'status' => InvoiceStatus::FINALIZED,
            ]);

            $order->update([
                'payment_status' => PaymentStatus::PAID,
                'payment_method' => $validated['payment_method'],
                'paid_at' => now(),
                'status' => OrderStatus::SERVED,
            ]);

            if ($order->table_id) {
                RestaurantTable::where('id', $order->table_id)->update(['status' => 'free']);
            }

            return response()->json([
                'status' => true,
                'message' => 'Factura emitida correctamente',
                'data' => $invoice->load('order'),
            ], 201);
        });
    }

    /**
     * Listar facturas de la sucursal del usuario.
     * GET /api/invoices
     */
    public function index(IndexInvoiceRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $user = $request->user();

        $query = Invoice::with(['order', 'cashier'])
            ->where('branch_id', $user->branch_id);

        if (isset($validated['date'])) {
            $query->whereDate('created_at', $validated['date']);
        }

        if (isset($validated['status'])) {
            $query->where('status', $validated['status']);
        }

        $invoices = $query->orderByDesc('created_at')->paginate(20);

        return response()->json([
            'status' => true,
            'data' => $invoices,
        ]);
    }

    /**
     * Detalle de factura (formato ticket).
     * GET /api/invoices/{id}
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $invoice = Invoice::with(['order.items.product', 'order.items.modifiers', 'cashier', 'branch'])
            ->findOrFail($id);

        if ($response = $this->authorizeBranchAccess($request->user(), $invoice->branch_id)) {
            return $response;
        }

        return response()->json([
            'status' => true,
            'data' => [
                'invoice' => $invoice,
                'ticket' => $this->buildTicket($invoice),
            ],
        ]);
    }

    /**
     * Anular factura.
     * PATCH /api/invoices/{id}/cancel
     */
    public function cancel(CancelInvoiceRequest $request, int $id): JsonResponse
    {
        $validated = $request->validated();
        $user = $request->user();
        $invoice = Invoice::findOrFail($id);

        if ($response = $this->authorizeBranchAccess($user, $invoice->branch_id)) {
            return $response;
        }

        if ($invoice->status === InvoiceStatus::CANCELLED) {
            return response()->json([
                'status' => false,
                'message' => 'Esta factura ya estaba anulada.',
            ], 422);
        }

        return DB::transaction(function () use ($invoice, $validated) {
            $invoice->cancel($validated['reason']);

            // Revertir orden a pendiente de pago (vuelve a aparecer como
            // "por cobrar" para el cajero).
            $invoice->order->update([
                'payment_status' => PaymentStatus::PENDING,
                'paid_at' => null,
                'status' => OrderStatus::READY,
            ]);

            return response()->json([
                'status' => true,
                'message' => 'Factura anulada correctamente',
                'data' => $invoice->fresh(),
            ]);
        });
    }

    /**
     * Un pedido tiene factura vigente si ya tiene una y no está anulada
     * (una anulada sí permite refacturar).
     */
    private function orderAlreadyInvoiced(Order $order): bool
    {
        return $order->invoice && $order->invoice->status !== InvoiceStatus::CANCELLED;
    }

    /**
     * Calcula subtotal/impuesto/descuento/total redondeados a 2 decimales,
     * evitando arrastrar errores de coma flotante en montos de dinero.
     *
     * @return array{subtotal: float, tax_amount: float, discount: float, total: float}
     */
    private function calculateAmounts(Order $order, bool $hasTax): array
    {
        $subtotal = round((float) $order->subtotal, 2);
        $taxRate = $order->branch?->tax_rate ?? 0;
        $taxAmount = $hasTax ? round($subtotal * ($taxRate / 100), 2) : 0.0;
        $discount = round((float) ($order->discount_amount ?? 0), 2);
        $total = max(0, round($subtotal + $taxAmount - $discount, 2));

        return [
            'subtotal' => $subtotal,
            'tax_amount' => $taxAmount,
            'discount' => $discount,
            'total' => $total,
        ];
    }

    /**
     * Arma el payload de ticket imprimible a partir de la factura.
     */
    private function buildTicket(Invoice $invoice): array
    {
        return [
            'header' => $invoice->branch?->settings['receipt_header'] ?? $invoice->branch?->name,
            'footer' => $invoice->branch?->settings['receipt_footer'] ?? 'Gracias por su preferencia',
            'invoice_number' => $invoice->invoice_number,
            'date' => $invoice->created_at->format('d/m/Y H:i'),
            'cashier' => $invoice->cashier?->name,
            'customer' => $invoice->customer_name ?? 'Consumidor Final',
            'nit' => $invoice->customer_nit ?? 'CF',
            'items' => $invoice->order->items->map(fn ($item) => [
                'product' => $item->product?->name,
                'quantity' => $item->quantity,
                'unit_price' => (float) $item->unit_price,
                'modifiers' => $item->modifiers->map(
                    fn ($m) => $m->option_name . ' (+' . $m->price_adjustment . ')'
                ),
                'subtotal' => (float) $item->subtotal,
            ]),
            'subtotal' => (float) $invoice->subtotal,
            'tax' => $invoice->has_tax ? (float) $invoice->tax_amount : 0,
            'discount' => (float) $invoice->discount_amount,
            'total' => (float) $invoice->total,
            'has_tax' => $invoice->has_tax,
        ];
    }
}