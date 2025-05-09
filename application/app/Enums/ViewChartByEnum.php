<?php

declare(strict_types=1);

namespace App\Enums;

enum ViewChartByEnum: string
{
    case Fund = 'Fund';
    case Year = 'Year';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
