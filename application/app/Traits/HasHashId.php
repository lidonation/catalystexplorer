<?php

declare(strict_types=1);

namespace App\Traits;

use App\Services\HashIdService;
use Illuminate\Database\Eloquent\Casts\Attribute;

trait HasHashId
{
    public function hash(): Attribute
    {
        return Attribute::make(
            get: fn () => (new HashIdService($this))->encode($this->getOriginal('id'))
        );
    }
}
