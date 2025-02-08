<?php

namespace App\Traits;

use App\Models\Location;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

trait HasLocations
{
    public function locations(): BelongsToMany
    {
        return $this->belongsToMany(Location::class, 'model_has_locations', 'model_id', 'location_id')
            ->where('model_type', static::class)
            ->withPivot('model_type');
    }
}
