<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Enums\InvoiceStatus;

class Invoice extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'branch_id', 'order_id', 'user_id', 'invoice_number',
        'customer_name', 'customer_nit', 'subtotal', 'tax_amount',
        'discount_amount', 'total', 'has_tax', 'status',
        'printed_at', 'cancellation_reason'
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'total' => 'decimal:2',
        'has_tax' => 'boolean',
        'status' => InvoiceStatus::class,
        'printed_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($invoice) {
            if (empty($invoice->invoice_number)) {
                $invoice->invoice_number = self::generateInvoiceNumber($invoice->branch_id);
            }
        });
    }

    public static function generateInvoiceNumber(int $branchId): string
    {
        $prefix = 'FAC';
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

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function cashier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function markAsPrinted(): void
    {
        $this->update([
            'status' => InvoiceStatus::FINALIZED,
            'printed_at' => now(),
        ]);
    }

    public function cancel(string $reason): void
    {
        $this->update([
            'status' => InvoiceStatus::CANCELLED,
            'cancellation_reason' => $reason,
        ]);
    }

    public function scopeToday($query)
    {
        return $query->whereDate('created_at', today());
    }

    public function scopeFinalized($query)
    {
        return $query->where('status', InvoiceStatus::FINALIZED);
    }
}
