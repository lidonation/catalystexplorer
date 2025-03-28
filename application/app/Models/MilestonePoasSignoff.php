<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MilestonePoasSignoff extends Model
{
    public $timestamps = false;

    public function poas(): BelongsTo
    {
        return $this->belongsTo(MilestonePoas::class, 'milestone_poas_id', 'id');
    }

    public function proposal(): BelongsTo
    {
        return $this->belongsTo(Proposal::class, 'proposal_id', 'id');
    }
}
