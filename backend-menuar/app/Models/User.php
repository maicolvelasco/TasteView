<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use App\Enums\RoleLevel;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        'branch_id', 'role_id', 'name', 'email', 'password',
        'phone', 'avatar_url', 'pin_code', 'is_active', 'last_login_at'
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'pin_code',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'last_login_at' => 'datetime',
        'password' => 'hashed',
        // El cast 'hashed' hace que Laravel hashee automáticamente el valor
        // cada vez que se asigna (create/update), igual que con password.
        // Nunca se debe comparar con '===' ni buscar con WHERE; siempre con
        // Hash::check() (ver AuthController::attemptPinLogin()).
        'pin_code' => 'hashed',
        'is_active' => 'boolean',
    ];

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }

    public function preparedItems(): HasMany
    {
        return $this->hasMany(OrderItem::class, 'prepared_by');
    }

    // ===== PERMISOS POR ROL =====

    public function isSuperAdmin(): bool
    {
        return $this->role?->level === RoleLevel::SUPER_ADMIN;
    }

    public function isAdmin(): bool
    {
        return $this->role?->level?->value >= RoleLevel::ADMIN->value;
    }

    public function isManager(): bool
    {
        return $this->role?->level?->value >= RoleLevel::MANAGER->value;
    }

    public function isCashier(): bool
    {
        return $this->role?->level?->value >= RoleLevel::CASHIER->value;
    }

    public function isChef(): bool
    {
        return $this->role?->level === RoleLevel::CHEF;
    }

    public function isWaiter(): bool
    {
        return $this->role?->level === RoleLevel::WAITER;
    }

    public function isKitchenOrCashier(): bool
    {
        return in_array($this->role?->level, [RoleLevel::CHEF, RoleLevel::CASHIER]);
    }

    public function canViewAllOrders(): bool
    {
        return $this->isAdmin() || $this->isKitchenOrCashier();
    }

    public function canManageMenu(): bool
    {
        return $this->isManager();
    }

    public function canManageBranches(): bool
    {
        return $this->isAdmin();
    }

    public function canManageUsers(): bool
    {
        return $this->isAdmin();
    }
}