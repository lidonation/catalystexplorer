<?php declare(strict_types=1);

namespace App\Enums;

use App\Enums\Traits\HasValues;
use Spatie\Enum\Laravel\Enum;

/**
 * @method static self FUND()
 * @method static self YEAR()
 * @method static self MONTH()
 * @method static self WEEK()
 * @method static self DAY()
 * @method static self HOUR()
 * @method static self MINUTE()
 */
final class MetricCountBy extends Enum
{
    USE HasValues;
}
