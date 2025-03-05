<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Support\Facades\Artisan;
use Laravel\Scout\Searchable;

class Review extends Model
{
    use Searchable;

    protected $guarded = [];

    public static function getFilterableAttributes(): array
    {
        return [
            'id',
            'title',
            'content',
            'status',
            'model_id',
            'model_type',
        ];
    }

    public static function getSearchableAttributes(): array
    {
        return [
            'id',
            'title',
            'content',
            'status',
        ];
    }

    public static function getSortableAttributes(): array
    {
        return [
            'id',
            'title',
            'status',
            'created_at',
        ];
    }

    public static function runCustomIndex(): void
    {
        Artisan::call('cx:create-search-index App\\\\Models\\\\Review cx_reviews');
    }

    public function discussion(): BelongsTo
    {
        return $this->belongsTo(Discussion::class, 'model_id')->where('model_type', Discussion::class);
    }

    public function rating(): HasOne
    {
        return $this->hasOne(Rating::class, 'review_id', 'id');
    }

    public function proposal()
    {
        return $this->hasOneThrough(Proposal::class, Moderation::class, 'review_id', 'id', 'id', 'context_id')
            ->where('moderations.context_type', Proposal::class);
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function model(): MorphTo
    {
        return $this->morphTo('model', 'model_type', 'model_id');
    }

    public function review_moderation_reviewer(): HasOne
    {
        return $this->hasOne(ReviewModerationReviewer::class, 'review_id');
    }

    public function toSearchableArray(): array
    {
        $this->load(['model', 'discussion', 'parent']);

        $array = $this->toArray();

        return array_merge($array, [
            'model' => $this->model?->toArray(),
            'discussion' => $this->discussion?->toArray(),
            'parent' => $this->parent?->toArray(),
            'children' => $this->children,
        ]);
    }
}
