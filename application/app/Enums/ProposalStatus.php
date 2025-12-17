<?php

declare(strict_types=1);

namespace App\Enums;

use Spatie\Enum\Laravel\Enum;

/**
 * @method static self pending()
 * @method static self complete()
 * @method static self in_progress()
 * @method static self unfunded()
 * @method static self onboarding()
 */
final class ProposalStatus extends Enum
{
    public static function values(): \Closure
    {
        return fn (string $name): string|int => $name;
    }
}
