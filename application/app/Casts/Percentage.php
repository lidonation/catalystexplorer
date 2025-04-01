<?php

declare(strict_types=1);

namespace App\Casts;

use Illuminate\Contracts\Database\Eloquent\CastsAttributes;
use Illuminate\Database\Eloquent\Model;
use InvalidArgumentException;

class Percentage implements CastsAttributes
{
    public function get(Model $model, string $key, mixed $value, array $attributes): ?float
    {
        if (is_null($value)) {
            return null;
        }

        if (! is_numeric($value)) {
            throw new InvalidArgumentException("The attribute $key must be numeric.");
        }

        return round(((float) $value) * 100, 2);
    }

    public function set(Model $model, string $key, mixed $value, array $attributes): ?float
    {
        return $value;
        // if (is_null($value)) {
        //     return null;
        // }

        // if (! is_numeric($value)) {
        //     throw new InvalidArgumentException("The attribute $key must be numeric.");
        // }

        // return round(((float) $value) / 100, 6);
    }
}
