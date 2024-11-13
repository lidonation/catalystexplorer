<?php

declare(strict_types=1);

namespace App\Models;

use App\Models\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReviewModerationReviewer extends Model
{

    public $timestamps = false;

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(Reviewer::class);
    }

    public function review(): BelongsTo
    {
        return $this->belongsTo(Review::class, 'reviewer_id');
    }

    public function review_moderation(): BelongsTo
    {
        return $this->belongsTo(ReviewModeration::class);
    }

}
