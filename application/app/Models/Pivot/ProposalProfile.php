<?php

declare(strict_types=1);

namespace App\Models\Pivot;

use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\Relations\Pivot;

class ProposalProfile extends Pivot
{
    protected $table = 'proposal_profiles';

    public function profiles(): MorphTo
    {
        return $this->morphTo(
            name: 'profiles',
            type: 'profile_type',
            id: 'profile_id',
            ownerKey: 'id'
        );
    }
}
