<?php

declare(strict_types=1);

namespace App\Enums\Traits;

trait HasValues
{
    public static function values(): \Closure
    {
        return fn (string $name): string|int => str_replace('_', ' ', mb_strtolower($name));
    }
}
