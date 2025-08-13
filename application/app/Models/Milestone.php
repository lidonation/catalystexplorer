<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class Milestone extends Model
{
    use HasUuids;

    public $timestamps = false;

    protected $with = [
        'som_reviews',
        'poas',
    ];

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
        return $this->belongsTo(ProjectSchedule::class, 'proposal_milestone_id');
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
