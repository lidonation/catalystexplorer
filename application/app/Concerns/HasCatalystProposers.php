<?php

declare(strict_types=1);

namespace App\Concerns;

use App\Models\Proposal;
use App\Models\User;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Relations\MorphToMany;

trait HasCatalystProposers
{
    public function heroImgUrl(): Attribute
    {
        return Attribute::make(
            get: fn () => count($this->getMedia('profile')) ? $this->getMedia('profile')[0]->getFullUrl() : $this->gravatar
        );
    }

    public function proposals(): MorphToMany
    {
        return $this->morphToMany(
            Proposal::class,
            'profile',
            'proposal_profiles',
            'profile_id',
            'proposal_id'
        )
            ->wherePivot('profile_type', static::class)
            ->whereNull('proposals.deleted_at')
            ->where('proposals.type', 'proposal');
    }

    /**
     * Get the users who have claimed this catalyst profile through pivot table
     * Reverse relationship of User::claimed_catalyst_profiles()
     */
    public function claimed_by_users()
    {
        return $this->belongsToMany(User::class, 'claimed_profiles', 'claimable_id', 'user_id')
            ->where('claimable_type', static::class)
            ->withPivot(['claimed_at'])
            ->withTimestamps();
    }
}
