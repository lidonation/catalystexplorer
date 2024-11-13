<?php declare(strict_types=1);

namespace App\Enums;

enum CatalystCurrencies: string
{
    case USD = 'USD';
    case ADA = 'ADA';

    public static function values(): array
    {
        return [
            self::USD->value,
            self::ADA->value,
        ];
    }
}
