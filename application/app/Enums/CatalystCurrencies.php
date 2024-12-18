<?php declare(strict_types=1);

namespace App\Enums;

use Spatie\Enum\Laravel\Enum;

/**
 * @method static self ADA()
 * @method static self USD()
 */
final class CatalystCurrencies extends Enum
{
    public static function values(): \Closure
    {
        return fn(string $name): string|int => $name;
    }
}
