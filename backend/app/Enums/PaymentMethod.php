<?php

namespace App\Enums;

enum PaymentMethod: string
{
    case Tunai = 'tunai';
    case Qris = 'qris';
    case Kartu = 'kartu';

    public function label(): string
    {
        return match ($this) {
            self::Tunai => 'Tunai',
            self::Qris => 'QRIS',
            self::Kartu => 'Kartu',
        };
    }
}
