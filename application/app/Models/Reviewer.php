<?php

declare(strict_types=1);

namespace App\Models;

use App\Models\CatalystExplorer\Moderation;
use App\Traits\HasMetaData;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Reviewer extends Model
{
    use HasMetaData;

    protected $guarded = [];

    public function v1_reviews(): BelongsToMany
    {
        return $this->belongsToMany(Review::class, 'review_moderation_reviewers', 'review_moderation_id', 'reviewer_id');
    }

    public function moderations(): HasMany
    {
        return $this->hasMany(Moderation::class, 'reviewer_id');
    }

    public function reputationScores(): HasMany
    {
        return $this->hasMany(ReviewerReputationScore::class, 'reviewer_id');
    }
}
