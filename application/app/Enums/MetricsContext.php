<?php

declare(strict_types=1);

namespace App\Enums;

enum MetricsContext: string
{
    case HOME = 'home';
    case FUND = 'fund';
    case CHARTS = 'charts';

    public static function values(): array
    {
        return [
            self::HOME,
            self::FUND,
            self::CHARTS,
        ];
    }
}
