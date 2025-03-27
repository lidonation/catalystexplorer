<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Milestone extends Model
{
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

    public function parent_milestone(): BelongsTo
    {
        return $this->belongsTo(ProjectSchedule::class, 'proposal_milestone_id', 'id');
    }

    public function som_reviews(): HasMany
    {
        return $this->hasMany(MilestoneSomReview::class, 'milestone_id', 'id');
    }

    public function poas(): HasMany
    {
        return $this->hasMany(MilestonePoas::class, 'milestone_id', 'id');
    }
}
