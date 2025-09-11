<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\Relations\Pivot;

class ProposalProfile extends Pivot
{
    protected $table = 'proposal_profiles';

    protected $fillable = [
        'proposal_id',
        'profile_id',
        'profile_type',
    ];

    /**
     * Get the proposal that belongs to this profile.
     */
    public function proposal(): BelongsTo
    {
        return $this->belongsTo(Proposal::class);
    }

    /**
     * Get the profile model (polymorphic).
     */
    public function profile(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Get the user who claimed this profile.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'claimed_by');
    }
}
