<?php

declare(strict_types=1);

namespace App\Models;

use Laravel\Scout\Searchable;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Staudenmeir\EloquentHasManyDeep\HasRelationships;
use Illuminate\Database\Eloquent\Relations\HasOneThrough;

class Review extends Model
{
    use Searchable, HasRelationships;

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
            'reviewer.reputation_scores.fund.id',
            'reviewer.reputation_scores.fund.label',
            'rating',
            'reviewer.avg_reputation_score',
            'proposal.id',
            'proposal.ideascale_profiles.id'
        ];
    }

    public static function getSearchableAttributes(): array
    {
        return [
            'id',
            'title',
            'content',
            'status',
            'reviewer_id',
            'reviewer.reputation_scores.fund',
            'proposal.title',
            'proposal.content',
            'proposal.ideascale_profiles.name',
            'proposal.ideascale_profiles.username'
        ];
    }

    public static function getSortableAttributes(): array
    {
        return [
            'id',
            'title',
            'status',
            'created_at',
            'reviewer.avg_reputation_score',
            'rating',
            'helpful_total',
            'not_helpful_total'
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



    public function proposal(): HasOneThrough
    {
        return $this->hasOneThrough(
            Proposal::class,
            Discussion::class,
            'id',         
            'id',       
            'model_id',   
            'model_id'    
        )->where('discussions.model_type', Proposal::class);;
    }


    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(Reviewer::class);
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
        $this->load(['model', 'discussion', 'parent', 'reviewer.reputation_scores.fund','proposal.ideascaleProfiles']);

        $array = $this->toArray();

        return array_merge($array, [
            'model' => $this->model?->toArray(),
            'discussion' => $this->discussion?->toArray(),
            'parent' => $this->parent?->toArray(),
            'children' => $this->children,
            'rating' => $this->rating?->rating,
        ]);
    }
}
