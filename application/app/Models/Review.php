<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\ProposalSearchParams;
use App\Traits\HasMetaData;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasOneThrough;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Laravel\Scout\Searchable;
use Staudenmeir\EloquentHasManyDeep\HasRelationships;

class Review extends Model
{
    use HasMetaData, HasRelationships, HasUuids, Searchable;

    protected $guarded = [];

    public $meiliIndexName = 'cx_reviews';

    public static function getFilterableAttributes(): array
    {
        return [
            'id',
            'title',
            'content',
            'reviewer.catalyst_reviewer_id',
            'reviewer.id',
            'reviewer_id',
            'reviewer.uuid',
            'positive_rankings',
            'negative_rankings',
            'status',
            'model_id',
            'model_type',
            'reviewer.reputation_scores.fund.id',
            'reviewer.reputation_scores.fund.label',
            'rating',
            'reviewer.avg_reputation_score',
            'proposal.id',
            'proposal.title',
            'proposal.id',
            'proposal.fund_id',
            'proposal.ideascale_profiles.id',
            'proposal.ideascale_profiles.id',
            'proposal.groups.id',
        ];
    }

    public static function getSearchableAttributes(): array
    {
        return [
            'id',
            'title',
            'content',
            'status',
            'model_type',
            'reviewer_id',
            'reviewer.uuid',
            'reviewer.reputation_scores.fund',
            'proposal.title',
            'proposal.id',
            'proposal.fund_id',
            'proposal.content',
            'proposal.ideascale_profiles.name',
            'proposal.ideascale_profiles.username',
            'proposal.groups.id',
        ];
    }

    public static function getSortableAttributes(): array
    {
        return [
            'id',
            'title',
            'status',
            'created_at',
            'updated_at',
            'reviewer.uuid',
            'reviewer.avg_reputation_score',
            'rating',
            'helpful_total',
            'proposal.id',
            'rankings',
            'positive_rankings',
            'negative_rankings',
            'proposal.groups.id',
        ];
    }

    public function discussion(): BelongsTo
    {
        return $this->belongsTo(Discussion::class, 'model_id', 'id')
            ->where('model_type', Discussion::class);
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
        )->where('discussions.model_type', Proposal::class);
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

    public function rankings(): HasMany
    {
        return $this->hasMany(Ranking::class, 'model_id')
            ->where('model_type', Review::class);
    }

    public function positiveRankings(): HasMany
    {
        return $this->rankings()
            ->where('value', '=', 1);
    }

    public function negativeRankings(): HasMany
    {
        return $this->rankings()
            ->where('value', '=', -1);
    }

    public function review_moderation_reviewer(): HasOne
    {
        return $this->hasOne(ReviewModerationReviewer::class, 'review_id');
    }

    public function scopeFilter($query, array $filters)
    {
        $query->when(
            $filters['fund'] ?? false,
            fn (Builder $query, $fund) => $query->whereHas('reviewer.reputation_scores', function ($query) use ($fund) {
                $query->whereHas('fund', function ($query) use ($fund) {
                    $query->where('label', $fund);
                });
            })
        );

        $query->when($filters['search'] ?? false, function ($query, $search) {
            $query->whereHas('proposals', function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%");
            });
        });

        $query->when(
            $filters['reviewer_ids'] ?? false,
            fn (Builder $query, $reviewerIds) => $query->whereHas('reviewer', function ($query) use ($reviewerIds) {
                $query->whereIn('catalyst_reviewer_id', $reviewerIds);
            })
        );

        if (isset($this->queryParams[ProposalSearchParams::HELPFUL()->value])) {
            if ($this->queryParams[ProposalSearchParams::HELPFUL()->value] === 'true') {
                $filters[] = 'positive_rankings > 0';
            } elseif ($this->queryParams[ProposalSearchParams::HELPFUL()->value] === 'false') {
                $filters[] = 'positive_rankings = 0';
            }
        }
    }

    public function toSearchableArray(): array
    {
        $this->load(['reviewer', 'model', 'rating', 'discussion']);

        // Safely load relationships with error handling
        $array = $this->toArray();

        // Remove hash field from indexing - we only use UUIDs now
        if (isset($array['hash'])) {
            unset($array['hash']);
        }

        // Initialize data arrays with safe defaults
        $modelData = null;
        $discussionData = null;
        $parentData = null;
        $positiveRankingsCount = 0;
        $negativeRankingsCount = 0;

        try {
            $modelData = $this->model?->toArray();
        } catch (\Exception $e) {
            \Log::error('Error loading model for review in toSearchableArray', [
                'review_id' => $this->id,
                'error' => $e->getMessage(),
            ]);
        }

        try {
            $discussionData = $this->discussion?->toArray();
        } catch (\Exception $e) {
            \Log::error('Error loading discussion for review in toSearchableArray', [
                'review_id' => $this->id,
                'error' => $e->getMessage(),
            ]);
        }

        try {
            $parentData = $this->parent?->toArray();
        } catch (\Exception $e) {
            \Log::error('Error loading parent for review in toSearchableArray', [
                'review_id' => $this->id,
                'error' => $e->getMessage(),
            ]);
        }

        try {
            $childrenData = $this->children;
        } catch (\Exception $e) {
            \Log::error('Error loading children for review in toSearchableArray', [
                'review_id' => $this->id,
                'error' => $e->getMessage(),
            ]);
        }

        try {
            $ratingValue = $this->rating?->rating;
        } catch (\Exception $e) {
            \Log::error('Error loading rating for review in toSearchableArray', [
                'review_id' => $this->id,
                'error' => $e->getMessage(),
            ]);
        }

        try {
            $reviewerData = $this->reviewer;
        } catch (\Exception $e) {
            \Log::error('Error loading rankings for review in toSearchableArray', [
                'review_id' => $this->id,
                'error' => $e->getMessage(),
            ]);
        }

        try {
            $rankingData = $this->rankings;
        } catch (\Exception $e) {
            \Log::error('Error loading rankings for review in toSearchableArray', [
                'review_id' => $this->id,
                'error' => $e->getMessage(),
            ]);
        }

        try {
            $positiveRankingsCount = $this->positiveRankings->count();
        } catch (\Exception $e) {
            \Log::error('Error loading positive rankings for review in toSearchableArray', [
                'review_id' => $this->id,
                'error' => $e->getMessage(),
            ]);
        }

        try {
            $negativeRankingsCount = $this->negativeRankings->count();
        } catch (\Exception $e) {
            \Log::error('Error loading negative rankings for review in toSearchableArray', [
                'review_id' => $this->id,
                'error' => $e->getMessage(),
            ]);
        }

        return array_merge($array, [
            'model_type' => 'review',
            'reviewer' => $reviewerData,
            'model' => $modelData,
            'discussion' => $discussionData,
            'parent' => $parentData,
            'children' => $childrenData,
            'rating' => $ratingValue,
            'ranking' => $rankingData,
            'positive_rankings' => $positiveRankingsCount,
            'negative_rankings' => $negativeRankingsCount,
        ]);
    }
}
