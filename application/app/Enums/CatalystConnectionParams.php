<?php

declare(strict_types=1);

namespace App\Enums;

use Spatie\Enum\Laravel\Enum;

/**
 * @method static self IDEASCALEPROFILE()
 * @method static self GROUP()
 * @method static self COMMUNITY()
 */
final class CatalystConnectionParams extends Enum
{
    protected static function values(): array
    {
        return [
            'IDEASCALEPROFILE' => 'ip',
            'GROUP' => 'g',
            'COMMUNITY' => 'c',
        ];
    }
}
