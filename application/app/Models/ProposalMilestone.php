<?php

declare(strict_types=1);

namespace App\Models;

use App\Models\Proposal;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProposalMilestone extends Model
{
    public $timestamps = false;

    public function proposal(): BelongsTo
    {
        return $this->belongsTo(Proposal::class, 'proposal_id', 'id');
    }

    public function milestones(): HasMany
    {
        return $this->hasMany(Milestone::class, 'proposal_milestone_id', 'id');
    }

    protected function onTrack(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->status !== 'paused'
        );
    }
}