<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\Pivot;

class ProductModifier extends Pivot
{
    use HasFactory;

    protected $table = 'product_modifiers';

    // La tabla product_modifiers tiene su propia columna "id" autoincremental
    // (a diferencia de un pivot típico sin clave propia), hay que declararlo.
    public $incrementing = true;

    protected $fillable = [
        'product_id', 'modifier_id',
        'is_required', 'min_selections', 'max_selections', 'disabled_option_ids'
    ];

    protected $casts = [
        'is_required' => 'boolean',
        'min_selections' => 'integer',
        'max_selections' => 'integer',
        'disabled_option_ids' => 'array',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function modifier(): BelongsTo
    {
        return $this->belongsTo(Modifier::class);
    }
}