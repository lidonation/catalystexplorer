<?php

declare(strict_types=1);

namespace App\Enums;

use Spatie\Enum\Laravel\Enum;

/**
 * @method static self NO()
 * @method static self ME()
 * @method static self EVERYONE()
 */
final class CommentsAllowance extends Enum
{
    protected static function values(): array
    {
        return [
            'NO' => 'no-one',
            'ME' => 'only-me',
            'EVERYONE' => 'everyone',
        ];
    }
}
