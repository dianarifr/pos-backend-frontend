<?php

namespace App\Support;

class Money
{
    /**
     * Format angka menjadi teks rupiah, cth. "Rp 15.000".
     */
    public static function format(int|float|string|null $amount): string
    {
        return 'Rp '.number_format((float) $amount, 0, ',', '.');
    }
}
