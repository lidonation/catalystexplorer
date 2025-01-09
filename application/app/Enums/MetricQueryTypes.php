<?php

declare(strict_types=1);

namespace App\Enums;

use App\Enums\Traits\HasValues;
use Spatie\Enum\Laravel\Enum;

/**
 * @method static self SUM()
 * @method static self AVG()
 * @method static self MAX()
 * @method static self MIN()
 * @method static self COUNT()
 */
final class MetricQueryTypes extends Enum
{
    use HasValues;
}
