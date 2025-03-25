<?php

declare(strict_types=1);

namespace App\Enums;

use Spatie\Enum\Enum;

/**
 
 * @method static self PAGE()
 * @method static self LIMIT()
 * @method static self QUERY()
 * @method static self SORTS()
 */
final class MilestoneSearchParams extends Enum
{
    protected static function values(): array
    {
        return [
            'PAGE' => 'p',
            'LIMIT' => 'l',
            'QUERY' => 'q',
            'SORTS' => 'st',
        ];
    }
}
