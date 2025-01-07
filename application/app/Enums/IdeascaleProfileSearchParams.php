<?php declare(strict_types=1);

namespace App\Enums;

use Spatie\Enum\Enum;

/**
 * @method static self LIMIT()
 * @method static self PAGE()
 * @method static self QUERY()
 */
final class IdeascaleProfileSearchParams extends Enum
{
    protected static function values(): array
    {
        return [
            'LIMIT' => 'l',
            'PAGE' => 'p',
            'QUERY' => 'q',
        ];
    }
}
