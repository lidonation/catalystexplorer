<?php

declare(strict_types=1);

namespace App\Enums;

use Spatie\Enum\Enum;

/**
 * @method static self LIMIT()
 * @method static self PAGE()
 * @method static self QUERY()
 * @method static self SECONDARY_QUERY()
 * @method static self SORTS()
 * @method static self CHOICE()
 * @method static self FUND()
 */
final class VoteSearchParams extends Enum
{
    protected static function values(): array
    {
        return [
            'LIMIT' => 'l',
            'PAGE' => 'p',
            'QUERY' => 'q',
            'SECONDARY_QUERY' => 'sq',
            'SORTS' => 'st',
            'CHOICE' => 'c',
            'FUND' => 'f',
        ];
    }
}
