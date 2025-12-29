<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MilestonePoa extends Model
{
    protected $guarded = [];

    public $table = 'milestone_poas';

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

    protected $with = [
        'reviews',
        'signoffs',
    ];

    public function milestone(): BelongsTo
    {
        return $this->belongsTo(Milestone::class, 'milestone_id', 'id');
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(MilestonePoasReview::class, 'milestone_poas_id', 'id');
    }

    public function signoffs(): HasMany
    {
        return $this->hasMany(MilestonePoasSignoff::class, 'milestone_poas_id', 'id');
    }

    public function proposal(): BelongsTo
    {
        return $this->belongsTo(Proposal::class, 'proposal_id', 'id');
    }
}
