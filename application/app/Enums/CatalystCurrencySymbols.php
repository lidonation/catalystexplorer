<?php

declare(strict_types=1);

namespace App\Enums;

enum CatalystCurrencySymbols: string
{
    case USD = '$';
    case ADA = '₳';
    case USDM = 'USDM';

    public static function values(): array
    {
        return [
            self::USD,
            self::ADA,
            self::USDM,
        ];
    }
}
