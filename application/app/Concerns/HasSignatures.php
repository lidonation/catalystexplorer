<?php

declare(strict_types=1);

namespace App\Concerns;

use App\Models\ModelSignature;
use App\Models\Signature;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

trait HasSignatures
{
    public function modelSignatures(): HasMany
    {
        return $this->hasMany(ModelSignature::class, 'model_id')
            ->where('model_type', static::class);
    }

    public function signatures(): HasManyThrough
    {
        return $this->hasManyThrough(
            Signature::class,
            ModelSignature::class,
            'model_id',
            'id',
            'id',
            'signature_id'
        )->where('model_signature.model_type', static::class);
    }
}
