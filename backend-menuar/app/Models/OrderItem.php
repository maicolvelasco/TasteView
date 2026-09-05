<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Enums\OrderItemStatus;

class OrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id', 'product_id', 'quantity', 'unit_price',
        'modifiers_total', 'subtotal', 'notes', 'status',
        'prepared_by', 'started_at', 'ready_at', 'served_at'
    ];

    protected $casts = [
        'quantity' => 'integer',
        'unit_price' => 'decimal:2',
        'modifiers_total' => 'decimal:2',
        'subtotal' => 'decimal:2',
        'status' => OrderItemStatus::class,
        'started_at' => 'datetime',
        'ready_at' => 'datetime',
        'served_at' => 'datetime',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function modifiers(): HasMany
    {
        return $this->hasMany(OrderItemModifier::class);
    }

    public function chef(): BelongsTo
    {
        return $this->belongsTo(User::class, 'prepared_by');
    }

    public function calculateSubtotal(): void
    {
        $modifiersTotal = $this->modifiers()->sum(
            fn($m) => $m->price_adjustment * $m->quantity
        );
        $this->modifiers_total = $modifiersTotal;
        $this->subtotal = ($this->unit_price * $this->quantity) + $modifiersTotal;
        $this->save();
    }

    public function scopePending($query)
    {
        return $query->where('status', OrderItemStatus::PENDING);
    }

    public function scopeInPreparation($query)
    {
        return $query->where('status', OrderItemStatus::IN_PREPARATION);
    }

    public function scopeReady($query)
    {
        return $query->where('status', OrderItemStatus::READY);
    }
}
