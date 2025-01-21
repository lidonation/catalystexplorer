<?php

declare(strict_types=1);

namespace App\Enums;

use Spatie\Enum\Laravel\Enum;

/**
 * @method static self ADA()
 * @method static self USD()
 * @method static self NO_CURRENCY()
 */
final class CatalystCurrencies extends Enum
{
    public static function values(): \Closure
    {
        return fn (string $name): string|int|null => match ($name) {
            'NO_CURRENCY' => null,
            default => $name
        };
    }
}
