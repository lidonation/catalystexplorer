<?php

declare(strict_types=1);

namespace App\Models;

use App\Models\Scopes\CreatedAtDateScope;
use Illuminate\Database\Eloquent\Attributes\ScopedBy;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

#[ScopedBy(CreatedAtDateScope::class)]
class Milestone extends Model
{
    use HasUuids;

    protected $guarded = [];

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
        'som_reviews',
        'poas',
    ];

    public function scopeCurrent($query)
    {
        return $query->where('current', 'TRUE');
    }

    public function completed(): Attribute
    {
        return Attribute::make(get: function () {
            return $this?->poas()?->count() > 0;
        });
    }

    public function proposal(): BelongsTo
    {
        return $this->belongsTo(Proposal::class, 'proposal_id', 'id');
    }

    public function fund(): BelongsTo
    {
        return $this->belongsTo(Fund::class, 'fund_id', 'id');
    }

    public function project_schedule(): BelongsTo
    {
        return $this->belongsTo(ProjectSchedule::class, 'project_schedule_id');
    }

    public function som_reviews(): HasMany
    {
        return $this->hasMany(MilestoneSomReview::class, 'milestone_id', 'id');
    }

    public function poa_reviews(): HasManyThrough|Milestone
    {
        return $this->hasManyThrough(MilestonePoasReview::class, Milestone::class, 'id', 'id');
    }

    public function poas(): HasMany
    {
        return $this->hasMany(MilestonePoa::class, 'milestone_id', 'id');
    }
}
