<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'branch_id', 'category_id', 'name', 'slug', 'description',
        'history', 'ingredients', 'price', 'cost', 'image_url',
        'model_3d_url', 'preparation_time_min', 'is_available',
        'has_modifiers', 'is_combo', 'combo_items', 'sort_order'
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'cost' => 'decimal:2',
        'preparation_time_min' => 'integer',
        'is_available' => 'boolean',
        'has_modifiers' => 'boolean',
        'is_combo' => 'boolean',
        'combo_items' => 'json',
        'sort_order' => 'integer',
    ];

    protected $appends = ['final_price'];

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function modifiers(): BelongsToMany
    {
        return $this->belongsToMany(Modifier::class, 'product_modifiers')
            ->using(ProductModifier::class)
            ->withPivot(['is_required', 'min_selections', 'max_selections', 'disabled_option_ids'])
            ->withTimestamps();
    }

    public function productModifiers(): HasMany
    {
        return $this->hasMany(ProductModifier::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function getFinalPriceAttribute(): float
    {
        return (float) $this->price;
    }

    public function scopeAvailable($query)
    {
        return $query->where('is_available', true);
    }

    public function scopeWithAR($query)
    {
        return $query->whereNotNull('model_3d_url');
    }
}