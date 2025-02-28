<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsToMany;


class Location extends Model
{
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


    public function casts(): array
    {
        return [];
    }

}
