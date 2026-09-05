<?php

namespace App\Enums;

enum OrderItemStatus: string
{
    case PENDING = 'pending';
    case IN_PREPARATION = 'in_preparation';
    case READY = 'ready';
    case SERVED = 'served';
    case CANCELLED = 'cancelled';

    public function label(): string
    {
        return match($this) {
            self::PENDING => 'Pendiente',
            self::IN_PREPARATION => 'En preparación',
            self::READY => 'Listo',
            self::SERVED => 'Servido',
            self::CANCELLED => 'Cancelado',
        };
    }
}
