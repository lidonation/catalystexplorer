<?php

declare(strict_types=1);

namespace App\Enums;

use App\Enums\Traits\HasValues;
use Spatie\Enum\Laravel\Enum;

/**
 * @method static self VALUE()
 * @method static self TREND()
 * @method static self PARTITION()
 * @method static self PROGRESS()
 * @method static self TABLE()
 * @method static self DISTRIBUTION()
 */
final class MetricTypes extends Enum
{
    use HasValues;

    protected static function values(): array
    {
        return [
            'VALUE' => 'value',
            'TREND' => 'trend',
            'PARTITION' => 'partition',
            'PROGRESS' => 'progress',
            'TABLE' => 'table',
            'DISTRIBUTION' => 'distribution',
        ];
    }
}
