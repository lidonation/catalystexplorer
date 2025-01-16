<?php

declare(strict_types=1);

namespace App\Enums;

use Spatie\Enum\Laravel\Enum;

/**
 * @method static self AMOUNT()
 * @method static self PROPOSALSCOUNT()
 * @method static self DESC()
 * @method static self ASC()
 */
final class CampaignsSortBy extends Enum
{
    protected static function values(): array
    {
        return [
            'AMOUNT' => 'amount',
            'PROPOSALSCOUNT' => 'proposals_count',
            'DESC' => 'desc',
            'ASC' => 'asc',
        ];
    }
}
