<?php

declare(strict_types=1);

namespace App\Enums;

enum VoteEnum: int
{
    case YES = 1;
    case NO = -1;
    case ABSTAIN = 0;

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
