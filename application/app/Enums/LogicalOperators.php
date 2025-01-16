<?php

declare(strict_types=1);

namespace App\Enums;

use Spatie\Enum\Laravel\Enum;

/**
 * @method static self AND()
 * @method static self OR()
 */
final class LogicalOperators extends Enum
{
    protected static function values(): array
    {
        return [
            'AND' => 'AND',
            'OR' => 'OR',
        ];
    }
}
