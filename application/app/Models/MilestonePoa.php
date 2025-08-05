<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MilestonePoa extends Model
{
    public $table = 'milestone_poas';

    public $timestamps = false;

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
