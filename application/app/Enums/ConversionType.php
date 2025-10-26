<?php

declare(strict_types=1);

namespace App\Enums;

use Spatie\Enum\Laravel\Enum;

/**
 * @method static self TO_VOTER()
 * @method static self TO_RESEARCH()
 */
final class ConversionType extends Enum
{
    protected static function values(): array
    {
        return [
            'TO_VOTER' => 'toVoter',
            'TO_RESEARCH' => 'toResearch',
        ];
    }
}
