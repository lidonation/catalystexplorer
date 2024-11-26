<?php

declare(strict_types=1);

namespace App\Enums;

use Spatie\Enum\Laravel\Enum;

/**
 * @method static self pending()
 * @method static self funded()
 * @method static self leftover()
 * @method static self over_budget()
 * @method static self not_approved()
 */
final class ProposalFundingStatus extends Enum
{
    public static function values(): \Closure
    {
        return fn(string $name): string|int => $name;
    }
}
