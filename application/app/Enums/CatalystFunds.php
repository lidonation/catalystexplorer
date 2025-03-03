<?php

declare(strict_types=1);

namespace App\Enums;

use Spatie\Enum\Laravel\Enum;

/**
 * @method static self ONE()
 * @method static self TWO()
 * @method static self THREE()
 * @method static self FOUR()
 * @method static self FIVE()
 * @method static self SIX()
 * @method static self SEVEN()
 * @method static self EIGHT()
 * @method static self NINE()
 * @method static self TEN()
 * @method static self ELEVEN()
 * @method static self TWELVE()
 * @method static self THIRTEEN()
 */
final class CatalystFunds extends Enum
{
    protected static function values(): array
    {
        return [
            'ZERO' => 0,
            'ONE' => 1,
            'TWO' => 95,
            'THREE' => 91,
            'FOUR' => 84,
            'FIVE' => 32,
            'SIX' => 21,
            'SEVEN' => 58,
            'EIGHT' => 61,
            'NINE' => 97,
            'TEN' => 113,
            'ELEVEN' => 129,
            'TWELVE' => 139,
            'THIRTEEN' => 146,
        ];
    }
}
