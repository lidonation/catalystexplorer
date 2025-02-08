<?php

namespace App\Traits;

use App\Models\Link;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

trait HasLinks
{
    public function links(): BelongsToMany
    {
        return $this->belongsToMany(Link::class, 'model_id', 'link_id')
            ->where('model_type', static::class)
            ->withPivot('model_type');
    }
}
