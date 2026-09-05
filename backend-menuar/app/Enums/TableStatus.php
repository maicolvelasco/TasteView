<?php

namespace App\Enums;

enum TableStatus: string
{
    case FREE = 'free';
    case OCCUPIED = 'occupied';
    case RESERVED = 'reserved';
    case CLEANING = 'cleaning';

    public function label(): string
    {
        return match($this) {
            self::FREE => 'Libre',
            self::OCCUPIED => 'Ocupada',
            self::RESERVED => 'Reservada',
            self::CLEANING => 'Limpieza',
        };
    }
}
