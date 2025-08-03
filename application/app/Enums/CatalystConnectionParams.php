<?php

declare(strict_types=1);

namespace App\Enums;

use Spatie\Enum\Laravel\Enum;

/**
 * @method static self IDEASCALEPROFILE()
 * @method static self GROUP()
 * @method static self COMMUNITY()
 * @method static self EXCLUDE_EXISTING()
 * @method static self DEPTH()
 */
final class CatalystConnectionParams extends Enum
{
    protected static function values(): array
    {
        return [
            'IDEASCALEPROFILE' => 'ip',
            'GROUP' => 'g',
            'COMMUNITY' => 'c',
            'EXCLUDE_EXISTING' => 'exclude_existing',
            'DEPTH' => 'depth',
        ];
    }
}
