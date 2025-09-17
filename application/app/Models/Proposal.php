<?php

declare(strict_types=1);

namespace App\Models;

use App\Casts\DateFormatCast;
use App\Enums\CatalystCurrencies;
use App\Models\Pivot\ProposalProfile;
use App\Models\Scopes\ProposalTypeScope;
use App\Traits\HasAuthor;
use App\Traits\HasConnections;
use App\Traits\HasDto;
use App\Traits\HasMetaData;
use App\Traits\HasTaxonomies;
use App\Traits\HasTranslations;
use Illuminate\Database\Eloquent\Attributes\ScopedBy;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasTimestamps;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Laravel\Scout\Searchable;
use Spatie\Comments\Models\Concerns\HasComments;
use Staudenmeir\EloquentHasManyDeep\HasRelationships;

#[ScopedBy(ProposalTypeScope::class)]
class Proposal extends Model
{
    use HasAuthor,
        HasComments,
        HasConnections,
        HasConnections,
        HasDto,
        HasMetaData,
        HasRelationships,
        HasTaxonomies,
        HasTimestamps,
        HasTranslations,
        HasUuids,
        Searchable,
        SoftDeletes;

    public array $translatable = [
        'title',
        'meta_title',
        'problem',
        'solution',
        'experience',
        'content',
    ];

    public array $translatableExcludedFromGeneration = [
        'meta_title',
    ];

    public int $maxValuesPerFacet = 12000;

    protected $guarded = ['user_id', 'created_at', 'funded_at'];

    protected $appends = [
        'link',
        'currency',
    ];

    public $meiliIndexName = 'cx_proposals';

    public static function getFilterableAttributes(): array
    {
        return [
            'id',
            'funded',
            'completed',
            'currency',
            'has_quick_pitch',
            'quickpitch',
            'quickpitch_length',
            'impact_proposal',
            'woman_proposal',
            'ideafest_proposal',
            'ca_rating',
            'alignment_score',
            'feasibility_score',
            'auditability_score',
            'over_budget',
            'campaign',
            'campaign.id',
            'groups',
            'communities',
            'amount_requested',
            'amount_received',
            'project_length',
            'opensource',
            'type',
            'paid',
            'fund.id',
            'fund',
            'users',
            'tags',
            'tags.id',
            'title',
            'categories',
            'funding_status',
            'status',
            'votes_cast',
            'amount_requested_USD',
            'amount_requested_ADA',
            'amount_received_ADA',
            'amount_received_USD',
            'amount_awarded_ADA',
            'amount_awarded_USD',
            'completed_amount_paid_USD',
            'completed_amount_paid_ADA',
            'campaign_id',
            'created_at',
            'created_at_timestamp',
            'funded_at',
        ];
    }

    public static function getSearchableAttributes(): array
    {
        return [
            'id',
            'title',
            'website',
            'excerpt',
            'content',
            'problem',
            'experience',
            'solution',
            'definition_of_success',
            'comment_prompt',
            'social_excerpt',
            'ranking_total',
            'users',
            'tags',
            'tags.id',
            'categories',
            'communities',
        ];
    }

    public static function getSortableAttributes(): array
    {
        return [
            'title',
            'amount_requested',
            'amount_received',
            'project_length',
            'quickpitch_length',
            'ca_rating',
            'alignment_score',
            'feasibility_score',
            'auditability_score',
            'created_at',
            'updated_at',
            'funded_at',
            'no_votes_count',
            'yes_votes_count',
            'abstain_votes_count',
            'ranking_total',
            'users.proposals_completed',
            'votes_cast',
            'funding_status',
        ];
    }

    public static function getRankingRules(): array
    {
        return [
            'words',
            'typo',
            'proximity',
            'attribute',
            'sort',
            'exactness',
        ];
    }

    public function scopeFilter($query, array $filters)
    {
        $idsFromHash = ! empty($filters['hashes']) ? (array) $filters['hashes'] : null;

        $query->when(
            $idsFromHash ?? false,
            fn (Builder $query, $search) => $query->whereIn('id', $idsFromHash)
        );

        $query->when(
            $filters['search'] ?? false,
            fn (Builder $query, $search) => $query->where('title', 'ILIKE', '%'.$search.'%')
        );

        $query->when(
            $filters['user_id'] ?? false,
            fn (Builder $query, $user_id) => $query->where('user_id', $user_id)
        );

        $query->when(
            $filters['campaign_id'] ?? false,
            fn (Builder $query, $campaign_id) => $query->where('campaign_id', $campaign_id)
        );

        $query->when(
            $filters['fund_id'] ?? false,
            fn (Builder $query, $fund_id) => $query->whereRelation('fund_id', '=', $fund_id)
        );
    }

    //    public function getRouteKeyName(): string
    //    {
    //        return 'slug';
    //    }

    public function currency(): Attribute
    {
        return Attribute::make(
            get: fn ($currency) => $currency ?? $this->campaign?->currency ?? $this->fund?->currency ?? CatalystCurrencies::ADA()->value,
        );
    }

    public function completed(): Attribute
    {
        return Attribute::make(
            get: function () {
                if ($this->status === 'complete') {
                    return 1;
                }

                if ($this->schedule?->status === 'completed') {
                    return 1;
                }

                return 0;
            }
        );
    }

    public function amountReceived(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => ($this->schedule?->funds_distributed ?? $value)
        );
    }

    public function projectLength(): Attribute
    {
        return Attribute::make(
            get: function ($value) {
                $metaValue = $this->meta_info?->project_length ?? null;

                if ($metaValue === null || $metaValue === '') {
                    $metaValue = $this->metas()
                        ->where('key', 'project_length')
                        ->value('content');
                }

                if ($metaValue !== null && $metaValue !== '') {
                    return is_numeric($metaValue) ? (int) $metaValue : $metaValue;
                }

                return $value;
            }
        );
    }

    public function quickPitchId(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->quickpitch ? collect(
                explode(
                    '/',
                    $this->quickpitch
                )
            )?->last() : null
        );
    }

    public function isImpactProposal(): Attribute
    {
        return Attribute::make(
            get: function () {
                if ($this->meta_info?->impact_proposal) {
                    return boolval($this->meta_info?->impact_proposal);
                }

                return false;
            }
        );
    }

    public function isWomanProposal(): Attribute
    {
        return Attribute::make(
            get: function () {
                if ($this->meta_info?->woman_proposal) {
                    return boolval($this->meta_info?->woman_proposal);
                }

                return false;
            }
        );
    }

    public function isIdeafestProposal(): Attribute
    {
        return Attribute::make(
            get: function () {
                if ($this->meta_info?->ideafest_proposal) {
                    return boolval($this->meta_info?->ideafest_proposal);
                }

                return false;
            }
        );
    }

    public function link(): Attribute
    {
        return Attribute::make(
            get: function () {
                return config('app.url')."/en/proposals/{$this->slug}";
            }
        );
    }

    public function schedule(): HasOne
    {
        return $this->hasOne(ProjectSchedule::class, 'proposal_id', 'id');
    }

    public function proposal_milestone(): HasOne
    {
        return $this->hasOne(ProjectSchedule::class, 'proposal_id', 'id');
    }

    public function milestones(): HasManyThrough|Proposal
    {
        return $this->hasManyThrough(Milestone::class, ProjectSchedule::class);
    }

    public function moderations(): HasMany
    {
        return $this->hasMany(Moderation::class, 'context_id', 'id')
            ->where('context_type', Proposal::class);
    }

    public function reviewsAttribute(): Attribute
    {
        return Attribute::make(
            get: function () {
                return Review::whereExists(function ($query) {
                    $query->select(DB::raw(1))
                        ->from('discussions')
                        ->whereRaw('discussions.old_id::text = reviews.model_id')
                        ->where('discussions.model_type', Proposal::class)
                        ->where('discussions.model_id', $this->id);
                })->get();
            }
        );
    }

    public function reviews(): HasManyThrough
    {
        return $this->hasManyThrough(
            Review::class,
            Discussion::class,
            'model_id', // Foreign key on discussions table
            'model_id', // Foreign key on reviews table
            'id',       // Local key on proposals table
            'id'        // Local key on discussions table
        )
            ->where('discussions.model_type', static::class);
    }

    public function discussions(): HasMany
    {
        return $this->hasMany(Discussion::class, 'model_id')
            ->where('model_type', '=', static::class)
            ->withCount(['ratings'])
            ->withAvg('ratings', 'rating');
    }

    public function ratings(): Attribute
    {
        return Attribute::make(
            get: function () {
                return DB::table('ratings')
                    ->join('reviews', 'reviews.id', '=', 'ratings.review_id')
                    ->join('moderations', 'moderations.review_id', '=', 'reviews.id')
                    ->where('moderations.context_type', Proposal::class)
                    ->where('moderations.context_id', $this->id)
                    ->select('ratings.*')
                    ->get();
            }
        );
    }

    public function avgRating(): Attribute
    {
        return Attribute::make(
            get: function () {
                return DB::table('ratings')
                    ->join('reviews', 'reviews.id', '=', 'ratings.review_id')
                    ->join('moderations', 'moderations.review_id', '=', 'reviews.id')
                    ->where('moderations.context_type', Proposal::class)
                    ->where('moderations.context_id', $this->id)
                    ->avg('ratings.rating');
            }
        );
    }

    public function ratingsAverage(): Attribute
    {
        return Attribute::make(get: fn () => $this->ratings->avg('rating'));
    }

    /**
     * Get the value used to index the model.
     */
    public function getScoutKey(): mixed
    {
        return $this->id;
    }

    public function getDiscussionRankingScore(string $discussionTitle): ?float
    {
        $rankingScoreAvg = $this->discussions
            ->where('title', $discussionTitle)
            ->pluck('ratings_avg_rating');

        return (count($rankingScoreAvg) > 0) ? floatval($rankingScoreAvg[0]) : null;
    }

    /**
     * Get the index able data array for the model.
     */
    public function toSearchableArray(): array
    {
        $array = $this->toArray();
        $this->load(['fund', 'communities']);

        return array_merge($array, [
            'funded' => (bool) $this->funded_at ? 1 : 0,
            'currency' => $this->currency,
            'amount_requested' => $this->amount_requested ? intval($this->amount_requested) : 0,
            'amount_received' => $this->amount_received ? intval($this->amount_received) : 0,
            'link' => $this->link,
            'created_at_timestamp' => $this->created_at ? Carbon::parse($this->created_at)->timestamp : null,
            'tags' => $this->tags,
            'fund' => [
                'id' => $this->fund?->id,
                'label' => $this->fund?->label,
                'title' => $this->fund?->title,
            ],
            'communities' => $this->communities->map(fn ($community) => [
                'id' => $community->id,
                'name' => $community->title,
                'amount' => $this->campaign?->amount,
                'currency' => $this->campaign?->currency,
            ]),
            'groups' => $this->groups->map(fn ($group) => [
                'id' => $group->id,
                'name' => $group->title,
            ]),
            'users' => $this->team->map(fn ($profile) => [
                'id' => $profile?->model?->id,
                'name' => $profile?->model?->name,
            ]),
            'campaign' => [
                'id' => $this->campaign?->id,
                'label' => $this->campaign?->label,
                'title' => $this->campaign?->title,
                'amount' => $this->campaign?->amount,
                'currency' => $this->campaign?->currency,
            ],
        ]);
    }

    public function campaign(): BelongsTo
    {
        return $this->belongsTo(Campaign::class, 'campaign_id', 'id');
    }

    /**
     * communities proposal belong to.
     */
    public function communities(): BelongsToMany
    {
        return $this->belongsToMany(Community::class, 'community_has_proposal', 'proposal_id', 'community_id');
    }

    public function fund(): BelongsTo
    {
        return $this->belongsTo(Fund::class, 'fund_id', 'id');
    }

    public function groups(): BelongsToMany
    {
        return $this->belongsToMany(
            Group::class,
            'group_has_proposal',
            'proposal_id',
            'group_id',
            'id',
            'id',
            'groups'
        );
    }

    public function team(): HasMany
    {
        return $this->hasMany(ProposalProfile::class, 'proposal_id', 'id')
            ->with([
                'model',
            ]);
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(IdeascaleProfile::class, 'user_id', 'old_id', 'author');
    }

    public function catalyst_profiles(): BelongsToMany
    {
        return $this->belongsToMany(CatalystProfile::class, 'catalyst_profile_has_proposal', 'proposal_id', 'catalyst_profile_id');
    }

    public function ideascale_profiles(): BelongsToMany
    {
        return $this->belongsToMany(IdeascaleProfile::class, 'ideascale_profile_has_proposal', 'proposal_id', 'ideascale_profile_id');
    }

    public function users(): HasMany
    {
        return $this->hasMany(ProposalProfile::class, 'proposal_id', 'id')
            ->with('model');
    }

    public function proposal_profiles(): HasMany
    {
        return $this->hasMany(ProposalProfile::class, 'proposal_id', 'id')
            ->with('model');
    }

    public function completedProjectNft(): Attribute
    {
        return Attribute::make(
            get: function () {
                $englishTitle = json_decode($this->title, true)['en'] ?? $this->title;

                return Nft::whereRelation(
                    'ideascale_profile',
                    fn ($q) => $q->whereIn('ideascale_profiles.id', $this->users->pluck('id')->toArray())
                )
                    ->whereJsonContains('metadata->Project Title', $englishTitle)
                    ->get();
            }
        );
    }

    public function userRationale(): Attribute
    {
        return Attribute::make(
            get: function () {
                $user = auth()->user();
                if (! $user) {
                    return null;
                }

                return $this->comments()
                    ->where('commentator_id', $user->id)
                    ->whereJsonContains('extra->type', 'rationale')
                    ->latest()
                    ->first()?->original_text;
            }
        );
    }

    public function commentableName(): string
    {
        return $this->title;
    }

    public function commentUrl(): string
    {
        return route('proposals.show', [
            'proposal' => $this->slug,
        ]);
    }

    /**
     * Modify the query used to retrieve models when making all the models searchable.
     */
    protected function makeAllSearchableUsing(Builder $query): Builder
    {
        // Temporarily disable relationship loading to debug UUID issue
        return $query; // Removed ->with(['tags', 'groups'])
    }

    protected function casts(): array
    {
        return [
            //            'id' => HashId::class,
            'amount_received' => 'integer',
            'amount_requested' => 'integer',
            'created_at' => DateFormatCast::class,
            'currency' => CatalystCurrencies::class.':nullable',
            'funded_at' => DateFormatCast::class,
            'funding_updated_at' => DateFormatCast::class,
            'offchain_metas' => 'array',
            'opensource' => 'boolean',
            'updated_at' => DateFormatCast::class,
            'meta_data' => 'array',
        ];
    }
}
