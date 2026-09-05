<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Enums\RoleLevel;

class Role extends Model
{
    use HasFactory;

    protected $primaryKey = 'id';
    public $incrementing = true;
    protected $keyType = 'int';

    protected $fillable = [
        'name', 'slug', 'description', 'level', 'is_system'
    ];

    protected $casts = [
        'level' => RoleLevel::class,
        'is_system' => 'boolean',
    ];

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function isSuperAdmin(): bool
    {
        return $this->level === RoleLevel::SUPER_ADMIN;
    }

    public function isAdminOrHigher(): bool
    {
        return $this->level->value >= RoleLevel::ADMIN->value;
    }

    public function isManagerOrHigher(): bool
    {
        return $this->level->value >= RoleLevel::MANAGER->value;
    }
}
