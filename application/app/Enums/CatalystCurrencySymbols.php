<?php

declare(strict_types=1);

namespace App\Enums;

enum CatalystCurrencySymbols: string
{
    case USD = '$';
    case ADA = '₳';

    public static function values(): array
    {
        return [
            self::USD,
            self::ADA,
        ];
    }
}
