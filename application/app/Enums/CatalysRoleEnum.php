<?php

declare(strict_types=1);

namespace App\Enums;

enum CatalysRoleEnum: string
{
    case CATALYST_USER = 'ca7a1457ef9f4c7f9c747f8c4a4cfa6c';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
