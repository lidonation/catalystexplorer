<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReviewModerationReviewer extends Model
{
    use HasUuids;

    public $timestamps = false;

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(Reviewer::class);
    }

    public function review(): BelongsTo
    {
        return $this->belongsTo(Review::class, 'review_id');
    }

    public function review_moderation(): BelongsTo
    {
        return $this->belongsTo(ReviewModeration::class);
    }
}
