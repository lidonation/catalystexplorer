<?php

declare(strict_types=1);

namespace App\Enums;

enum MilestoneRoleEnum: int
{
    use Traits\HasValues;

    case ZERO = 0;
    case ONE = 1;
    case TWO = 2;
    case THREE = 3;
    case FOUR = 4;

    public function role(): string
    {
        return match ($this) {
            self::ZERO => 'Milestone reviewer',
            self::ONE => 'Milestone reviewer',
            self::TWO => 'Catalyst team reviewer',
            self::THREE => 'Catalyst team reviewer',
            self::FOUR => 'Catalyst Team reviewer',
        };
    }
}