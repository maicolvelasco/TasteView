<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Enums\TableStatus;

class RestaurantTable extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'tables';

    protected $fillable = [
        'branch_id', 'number', 'name', 'capacity',
        'qr_code', 'status', 'is_active'
    ];

    protected $casts = [
        'capacity' => 'integer',
        'status' => TableStatus::class,
        'is_active' => 'boolean',
    ];

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class, 'table_id');
    }

    public function isFree(): bool
    {
        return $this->status === TableStatus::FREE;
    }

    public function scopeFree($query)
    {
        return $query->where('status', TableStatus::FREE);
    }
}
