<?php

declare(strict_types=1);

namespace App\Enums;

use Spatie\Enum\Laravel\Enum;

/**
 * @method static self PROPOSALS_SLUG_MAX_LENGTH()
 * @method static self PER_PAGE_RELATIONSHIP()
 */
final class CatalystGlobals extends Enum
{
    public static function values(): \Closure
    {
        return fn (string $name): string|int => match ($name) {
            'PROPOSALS_SLUG_MAX_LENGTH' => config('catalyst.proposals_slug_max_length'),
            'PER_PAGE_RELATIONSHIP' => config('catalyst.per_page_relationships'),
            default => $name
        };
    }
}
