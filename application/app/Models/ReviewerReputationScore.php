<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class ReviewerReputationScore extends Model
{
    use SoftDeletes;

    protected $guarded = [];

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(Reviewer::class, 'reviewer_id');
    }

    public function context(): MorphTo
    {
        return $this->morphTo('context', 'context_type', 'context_id');
    }

    public function score(): Attribute
    {
        return Attribute::make(
            get: fn () => (bool) $this->score ? $this->score * 100 : 0,
        );
    }
}
