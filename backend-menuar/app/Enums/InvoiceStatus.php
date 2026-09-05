<?php

namespace App\Enums;

enum InvoiceStatus: string
{
    case DRAFT = 'draft';
    case FINALIZED = 'finalized';
    case CANCELLED = 'cancelled';

    public function label(): string
    {
        return match($this) {
            self::DRAFT => 'Borrador',
            self::FINALIZED => 'Finalizada',
            self::CANCELLED => 'Anulada',
        };
    }
}
