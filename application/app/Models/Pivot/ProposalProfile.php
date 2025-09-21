<?php

declare(strict_types=1);

namespace App\Models\Pivot;

use App\Models\Proposal;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\Relations\Pivot;

class ProposalProfile extends Pivot
{
    protected $table = 'proposal_profiles';

    public function model(): MorphTo
    {
        return $this->morphTo(
            name: 'model',
            type: 'profile_type',
            id: 'profile_id',
            ownerKey: 'id'
        );
    }

    public function proposal(): BelongsTo
    {
        return $this->belongsTo(Proposal::class, 'proposal_id', 'id');
    }
}
