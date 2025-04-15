<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\ProposalSearchParams;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasOneThrough;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Support\Facades\Artisan;
// use Laravel\Scout\Builder;
use Laravel\Scout\Searchable;
use Staudenmeir\EloquentHasManyDeep\HasRelationships;

class Review extends Model
{
    use HasRelationships, Searchable;

    protected $guarded = [];

    public static function getFilterableAttributes(): array
    {
        return [
            'id',
            'title',
            'content',
            'reviewer.catalyst_reviewer_id',
            'positive_rankings',
            'negative_ranings',
            'status',
            'model_id',
            'model_type',
            'reviewer.reputation_scores.fund.id',
            'reviewer.reputation_scores.fund.label',
            'rating',
            'reviewer.avg_reputation_score',
            'proposal.id',
            'proposal.ideascale_profiles.hash',
            'proposal.ideascale_profiles.id',
            'proposal.groups.hash',
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
            'proposal.ideascale_profiles.username',
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
            'rankings',
            'positive_rankings',
            'negative_rankings',
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

        $query->when($filters['ids'] ?? false, function ($query, $ids) {
            $query->whereIn('proposal_id', $ids);
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
        $this->load(['model', 'discussion', 'parent', 'reviewer.reputation_scores.fund', 'proposal']);

        $array = $this->toArray();

        return array_merge($array, [
            'model' => $this->model?->toArray(),
            'discussion' => $this->discussion?->toArray(),
            'parent' => $this->parent?->toArray(),
            'children' => $this->children,
            'rating' => $this->rating?->rating,
            'ranking' => $this->rankings,
            'positive_rankings' => $this->positiveRankings->count(),
            'negative_rankings' => $this->negativeRankings->count(),
        ]);
    }
}
