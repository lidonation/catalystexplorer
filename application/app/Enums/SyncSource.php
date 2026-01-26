<?php

declare(strict_types=1);

namespace App\Enums;

enum SyncSource: string
{
    case Blockfrost = 'blockfrost';
    case HashArray = 'hashArray';

    public static function fromString(string $value): ?self
    {
        return self::tryFrom($value);
    }
}
