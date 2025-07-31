<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MilestonePoasReview extends Model
{
    public $timestamps = false;

    public function proposal(): BelongsTo
    {
        return $this->belongsTo(Proposal::class, 'proposal_id', 'id');
    }

    public function poa(): BelongsTo
    {
        return $this->belongsTo(MilestonePoa::class, 'milestone_poas_id', 'id');
    }
}
