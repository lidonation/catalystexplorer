<?php

namespace App\Models\Traits;

use App\Models\Signature;
use App\Models\ModelSignature;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
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
            Signature::class,            // Final related model
            ModelSignature::class,       // Intermediate model (pivot)
            'model_id',                  // Foreign key on pivot
            'id',                        // Foreign key on Signature
            'id',                        // Local key on this model
            'signature_id'               // Local key on pivot
        )->where('model_signatures.model_type', static::class);
    }
}
