<?php

namespace App\Enums;

enum OrderStatus: string
{
    case PENDING = 'pending';
    case CONFIRMED = 'confirmed';
    case IN_PREPARATION = 'in_preparation';
    case READY = 'ready';
    case SERVED = 'served';
    case CANCELLED = 'cancelled';

    public function label(): string
    {
        return match($this) {
            self::PENDING => 'Pendiente',
            self::CONFIRMED => 'Confirmado',
            self::IN_PREPARATION => 'En preparación',
            self::READY => 'Listo',
            self::SERVED => 'Servido',
            self::CANCELLED => 'Cancelado',
        };
    }

    public function color(): string
    {
        return match($this) {
            self::PENDING => '#f59e0b',
            self::CONFIRMED => '#3b82f6',
            self::IN_PREPARATION => '#8b5cf6',
            self::READY => '#10b981',
            self::SERVED => '#059669',
            self::CANCELLED => '#ef4444',
        };
    }
}
