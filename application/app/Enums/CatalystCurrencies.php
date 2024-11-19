<?php declare(strict_types=1);

namespace App\Enums;

use Spatie\Enum\Laravel\Enum;

/**
 * @method static self ADA()
 * @method static self USD()
 */
final class CatalystCurrencies extends Enum
{
    use Traits\HasValues;
}
