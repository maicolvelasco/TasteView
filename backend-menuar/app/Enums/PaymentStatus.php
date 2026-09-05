<?php

namespace App\Enums;

enum PaymentStatus: string
{
    case PENDING = 'pending';
    case PARTIAL = 'partial';
    case PAID = 'paid';
    case REFUNDED = 'refunded';

    public function label(): string
    {
        return match($this) {
            self::PENDING => 'Pendiente',
            self::PARTIAL => 'Parcial',
            self::PAID => 'Pagado',
            self::REFUNDED => 'Reembolsado',
        };
    }
}
