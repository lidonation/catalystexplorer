<?php

declare(strict_types=1);

namespace App\Casts;

use Carbon\Carbon;
use Illuminate\Contracts\Database\Eloquent\CastsAttributes;

class DateFormatCast implements CastsAttributes
{
    public function get($model, string $key, $value, array $attributes): ?string
    {
        return $value ? Carbon::parse($value)->format('Y-m-d') : null;
    }

    public function set($model, string $key, $value, array $attributes)
    {
        return $value;
    }
}
