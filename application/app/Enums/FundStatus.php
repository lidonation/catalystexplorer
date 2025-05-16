<?php

declare(strict_types=1);

namespace App\Enums;

use Spatie\Enum\Laravel\Enum;

/**
 * @method static self LAUNCHED()
 * @method static self IN_PROGRESS()
 * @method static self COMPLETED()
 */
final class FundStatus extends Enum
{
    protected static function values(): array
    {
        return [
            'LAUNCHED' => 'launched',
            'IN_PROGRESS' => 'in_progress',
            'COMPLETED' => 'completed',
        ];
    }
}
