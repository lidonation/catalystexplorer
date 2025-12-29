<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MilestonePoasSignoff extends Model
{
    protected $guarded = [];

    protected $table = 'milestone_poas_signoffs';

    const UPDATED_AT = 'updated_at';

    const CREATED_AT = 'created_at';

    /**
     * Update the creation and update timestamps, but only set updated_at.
     */
    public function updateTimestamps(): void
    {
        $time = $this->freshTimestamp();

        $updatedAtColumn = $this->getUpdatedAtColumn();

        if (! is_null($updatedAtColumn) && ! $this->isDirty($updatedAtColumn)) {
            $this->setUpdatedAt($time);
        }
    }

    public function poas(): BelongsTo
    {
        return $this->belongsTo(MilestonePoa::class, 'milestone_poas_id', 'id');
    }

    public function proposal(): BelongsTo
    {
        return $this->belongsTo(Proposal::class, 'proposal_id', 'id');
    }

    public function poa(): BelongsTo
    {
        return $this->belongsTo(MilestonePoa::class, 'milestone_poas_id', 'id');
    }
}
