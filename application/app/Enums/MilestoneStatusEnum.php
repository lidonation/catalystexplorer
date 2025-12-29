<?php

declare(strict_types=1);

namespace App\Enums;

enum MilestoneStatusEnum: int
{
    use Traits\HasValues;

    case ZERO = 0;
    case ONE = 1;
    case TWO = 2;
    case THREE = 3;

    public function status(): string
    {
        return match ($this) {
            self::ZERO => 'active',
            self::ONE => 'paused',
            self::TWO => 'terminated',
            self::THREE => 'completed',
        };
    }
}
