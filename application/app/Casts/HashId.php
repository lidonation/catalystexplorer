<?php

declare(strict_types=1);

namespace App\Casts;

use App\Services\HashIdService;
use Illuminate\Contracts\Database\Eloquent\CastsAttributes;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;

class HashId implements CastsAttributes
{
    /**
     * Cast the given value.
     *
     * @param  array<string, mixed>  $attributes
     */
    public function get(Model $model, string $key, mixed $value, array $attributes): mixed
    {
        if (is_null($value)) {
            return $value;
        }
        if (app()->runningInConsole()) {
            return $value;
        }

        if (
            Route::currentRouteName() != null &&
            Str::of(
                Route::currentRouteName()
            )->contains(['nova.', 'horizon.', 'nova-api'])
        ) {
            return $value;
        }

        return (new HashIdService($model))->encode($value);
    }

    /**
     * Prepare the given value for storage.
     *
     * @param  array<string, mixed>  $attributes
     */
    public function set(Model $model, string $key, mixed $value, array $attributes): mixed
    {
        if (app()->runningInConsole()) {
            return $value;
        }

        if (
            Route::currentRouteName() != null &&
            Str::of(
                Route::currentRouteName()
            )->contains(['nova.', 'horizon.', 'nova-api'])
        ) {
            return $value;
        }

        return (new HashIdService($model))->decode($value);
    }
}
