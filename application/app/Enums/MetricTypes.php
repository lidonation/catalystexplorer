<?php declare(strict_types=1);

namespace App\Enums;

use App\Enums\Traits\HasValues;
use Spatie\Enum\Laravel\Enum;

/**
 * @method static self VALUE()
 * @method static self TREND()
 * @method static self PARTITION()
 * @method static self PROGRESS()
 * @method static self TABLE()
 */
final class MetricTypes extends Enum
{
    USE HasValues;
}
