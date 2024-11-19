<?php declare(strict_types=1);

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
            'ONE' => 1,
            'TWO' => 2,
            'THREE' => 3,
            'FOUR' => 4,
            'FIVE' => 5,
            'SIX' => 6,
            'SEVEN' => 7,
            'EIGHT' => 8,
            'NINE' => 9,
            'TEN' => 10,
            'ELEVEN' => 11,
            'TWELVE' => 12,
            'THIRTEEN' => 13
        ];
    }
}
