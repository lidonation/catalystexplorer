<?php

declare(strict_types=1);

namespace App\Enums;

use Spatie\Enum\Enum;

/**
 * @method static self LIMIT()
 * @method static self PAGE()
 * @method static self QUERY()
 * @method static self SORTS()
 * @method static self choice()
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
            'SORTS' => 'st',
            'CHOICE' => 'c',
            'FUND' => 'f',
        ];
    }
}
