<?php

declare(strict_types=1);

namespace App\Models\Pivot;

use Illuminate\Database\Eloquent\Relations\Pivot;

class CommunityProposal extends Pivot
{
    protected $table = 'community_has_proposal';

    public $timestamps = false;
}
