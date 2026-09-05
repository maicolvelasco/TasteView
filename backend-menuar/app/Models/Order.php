<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use App\Enums\OrderStatus;
use App\Enums\OrderType;
use App\Enums\PaymentStatus;
use App\Enums\PaymentMethod;

class Order extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'branch_id', 'table_id', 'user_id', 'order_number',
        'customer_name', 'customer_phone', 'order_type', 'status',
        'payment_status', 'payment_method', 'subtotal', 'tax_amount',
        'discount_amount', 'total', 'notes', 'guests_count', 'paid_at'
    ];

    protected $casts = [
        'order_type' => OrderType::class,
        'status' => OrderStatus::class,
        'payment_status' => PaymentStatus::class,
        'payment_method' => PaymentMethod::class,
        'subtotal' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'total' => 'decimal:2',
        'guests_count' => 'integer',
        'paid_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($order) {
            if (empty($order->order_number)) {
                $order->order_number = self::generateOrderNumber($order->branch_id);
            }
        });
    }

    public static function generateOrderNumber(int $branchId): string
    {
        $prefix = 'ORD';
        $branchCode = str_pad($branchId, 3, '0', STR_PAD_LEFT);
        $date = now()->format('Ymd');
        $count = self::where('branch_id', $branchId)
            ->whereDate('created_at', today())
            ->count() + 1;
        $suffix = str_pad($count, 4, '0', STR_PAD_LEFT);

        return "{$prefix}-{$branchCode}-{$date}-{$suffix}";
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function table(): BelongsTo
    {
        return $this->belongsTo(RestaurantTable::class, 'table_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function invoice(): HasOne
    {
        return $this->hasOne(Invoice::class);
    }

    public function recalculateTotals(): void
    {
        $subtotal = $this->items()->sum('subtotal');
        $tax = $this->branch?->tax_rate ?? 0;
        $taxAmount = $subtotal * ($tax / 100);
        $discount = $this->discount_amount ?? 0;
        $total = $subtotal + $taxAmount - $discount;

        $this->update([
            'subtotal' => $subtotal,
            'tax_amount' => $taxAmount,
            'total' => max(0, $total),
        ]);
    }

    public function scopeToday($query)
    {
        return $query->whereDate('created_at', today());
    }

    public function scopePending($query)
    {
        return $query->where('status', OrderStatus::PENDING);
    }

    public function scopeActive($query)
    {
        return $query->whereNotIn('status', [
            OrderStatus::SERVED->value,
            OrderStatus::CANCELLED->value
        ]);
    }
}
