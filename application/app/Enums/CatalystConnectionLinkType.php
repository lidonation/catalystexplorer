<?php

declare(strict_types=1);

namespace App\Enums;

use Spatie\Enum\Laravel\Enum;

/**
 * @method static self PROFILE()
 * @method static self GROUP()
 */
final class CatalystConnectionLinkType extends Enum
{
    protected static function values(): array
    {
        return [
            'PROFILE' => 'profile-link',
            'GROUP' => 'group-link',
        ];
    }
}
