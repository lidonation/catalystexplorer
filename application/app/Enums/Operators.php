<?php

declare(strict_types=1);

namespace App\Enums;

use Spatie\Enum\Laravel\Enum;

/**
 * @method static self EQUALS_TO()
 * @method static self NOT_EQUALS_TO()
 * @method static self GREATER_THAN()
 * @method static self LESS_THAN()
 * @method static self GREATER_THAN_OR_EQUALS_TO()
 * @method static self LESS_THAN_OR_EQUALS_TO()
 * @method static self IS_NULL()
 * @method static self IS_NOT_NULL()
 * @method static self IN()
 * @method static self NOT_IN()
 */
final class Operators extends Enum
{
    protected static function values(): array
    {
        return [
            'EQUALS_TO' => '=',
            'NOT_EQUALS_TO' => '!=',
            'GREATER_THAN' => '>',
            'LESS_THAN' => '<',
            'GREATER_THAN_OR_EQUALS_TO' => '>=',
            'LESS_THAN_OR_EQUALS_TO' => '<=',
            'IS_NULL' => 'IS NULL',
            'IS_NOT_NULL' => 'IS NOT NULL',
            'IN' => 'IN',
            'NOT_IN' => 'NOT IN',
        ];
    }
}
