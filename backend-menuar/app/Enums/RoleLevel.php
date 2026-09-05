<?php

namespace App\Enums;

enum RoleLevel: int
{
    case SUPER_ADMIN = 100;
    case ADMIN = 90;
    case MANAGER = 70;
    case CASHIER = 50;
    case CHEF = 40;
    case WAITER = 30;
    case CUSTOMER = 10;

    public function label(): string
    {
        return match($this) {
            self::SUPER_ADMIN => 'Super Admin',
            self::ADMIN => 'Administrador',
            self::MANAGER => 'Gerente',
            self::CASHIER => 'Cajero',
            self::CHEF => 'Cocinero',
            self::WAITER => 'Mesero',
            self::CUSTOMER => 'Cliente',
        };
    }
}
