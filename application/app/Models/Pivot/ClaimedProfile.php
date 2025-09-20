<?php

declare(strict_types=1);

namespace App\Models\Pivot;

use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\Relations\Pivot;

/**
 * ClaimedProfile pivot model with extra columns
 *
 * Follows the same pattern as ProposalProfile - a pivot table with additional columns
 * like 'claimed_at' that need to be preserved in the relationship.
 */
class ClaimedProfile extends Pivot
{
    protected $table = 'claimed_profiles';

    protected $casts = [
        'claimed_at' => 'datetime',
    ];

    /**
     * The claimable profile (CatalystProfile or IdeascaleProfile)
     * Uses the same morphTo pattern as ProposalProfile
     */
    public function claimable(): MorphTo
    {
        return $this->morphTo(
            name: 'claimable',
            type: 'claimable_type',
            id: 'claimable_id',
            ownerKey: 'id'
        );
    }
}
