<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\MorphToMany;

class CatalystProfile extends Model
{
    use HasUuids;

    public $guarded = [];

    /**
     * Get all proposals that are associated with this catalyst profile.
     */
    public function proposals(): MorphToMany
    {
        return $this->morphToMany(
            Proposal::class,
            'profile',
            'proposal_profiles',
            'profile_id',
            'proposal_id'
        );
    }
}
