<?php

declare(strict_types=1);

namespace App\Models;

use App\Casts\Percentage;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class ReviewerReputationScore extends Model
{
    use SoftDeletes;

    protected $guarded = [];

    protected $keyType = 'int';

    public $incrementing = true;

    public function uniqueIds(): array
    {
        return [];
    }

    protected function casts(): array
    {
        return [
            'score' => Percentage::class,
        ];
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(Reviewer::class, 'reviewer_id');
    }

    public function context(): MorphTo
    {
        return $this->morphTo('context', 'context_type', 'context_id');
    }

    public function fund(): BelongsTo
    {
        return $this->belongsTo(Fund::class, 'context_id');
    }
}
