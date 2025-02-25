<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class ReviewModeration extends Model
{
    protected $guarded = [];

    public function reviews(): BelongsToMany
    {
        return $this->belongsToMany(Review::class, 'review_moderation_reviewers', 'review_moderation_id', 'reviewer_id');
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(Reviewer::class, 'reviewer_id');
    }
}
