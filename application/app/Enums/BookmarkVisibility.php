<?php

declare(strict_types=1);

namespace App\Enums;

use Spatie\Enum\Laravel\Enum;

/**
 * @method static self PUBLIC()
 * @method static self UNLISTED()
 * @method static self PRIVATE()
 */
final class BookmarkVisibility extends Enum
{
    protected static function values(): array
    {
        return [
            'PUBLIC' => 'public',
            'UNLISTED' => 'unlisted',
            'PRIVATE' => 'private',
        ];
    }
}
