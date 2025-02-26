<?php

declare(strict_types=1);

namespace App\Enums;

enum MilestoneStatusEnum: int
{
    use Traits\HasValues;

    case ZERO = 0;
    case ONE = 1;
    case THREE = 3;

    public function status(): string
    {
        return match ($this) {
            self::ZERO => 'null',
            self::ONE => 'paused',
            self::THREE => 'completed',
        };
    }
}
