<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphToMany;

class Location extends Model
{
    protected $fillable = ['city'];

    protected $hidden = ['id', 'pivot.location_id'];

    /**
     * The roles that belong to the user.
     */
    public function groups(): BelongsToMany
    {
        return $this->belongsToMany(
            Proposal::class, 'model_has_locations', 'model_id', 'location_id'
        )->where('model_type', Group::class);
    }

    public function models(): MorphToMany
    {
        return $this->morphToMany(Location::class,
            'model_tag',
            'location_id',
            'model_id'
        );
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function services(): MorphToMany
    {
        return $this->morphToMany(Service::class, 'model', 'model_has_locations');
    }

    public function getDisplayNameAttribute(): string
    {
        return $this->city ?? 'Unknown Location';
    }

    public function casts(): array
    {
        return [];
    }
}
