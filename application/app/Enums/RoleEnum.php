<?php

declare(strict_types=1);

namespace App\Enums;

use Spatie\Enum\Laravel\Enum;

/**
 * @method static self contributor()
 * @method static self viewer()
 * @method static self editor()
 * @method static self admin()
 * @method static self super_admin()
 */
final class RoleEnum extends Enum
{
    protected static function values(): \Closure
    {
        return fn(string $name): string|int => str_replace('_', ' ', mb_strtolower($name));
    }
}
