<?php

declare(strict_types=1);

namespace App\Models;

use App\Models\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Reviewer extends Model
{
    public function reviews(): BelongsToMany
    {
        return $this->belongsToMany(Review::class, 'review_moderation_reviewers', 'review_moderation_id', 'reviewer_id');
    }

    public function review_moderations(): HasMany
    {
        return $this->hasMany(ReviewModeration::class);
    }
}
