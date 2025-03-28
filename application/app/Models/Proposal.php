<?php

declare(strict_types=1);

namespace App\Models;

use App\Casts\DateFormatCast;
use App\Enums\CatalystCurrencies;
use App\Traits\HasAuthor;
use App\Traits\HasMetaData;
use App\Traits\HasTaxonomies;
use App\Traits\HasTranslations;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasTimestamps;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Laravel\Scout\Searchable;

class Proposal extends Model
{
    use HasAuthor,
        HasMetaData,
        HasTaxonomies,
        HasTimestamps,
        HasTranslations,
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
        'hash',
        'currency',
    ];

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
            'funded_at',
            'no_votes_count',
            'yes_votes_count',
            'abstain_votes_count',
            'ranking_total',
            'users.proposals_completed',
            'votes_cast',
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

    public static function runCustomIndex(): void
    {
        Artisan::call('cx:create-search-index', [
            'model' => Proposal::class,
            'name' => 'cx_proposals',
        ]);
    }

    public function scopeFilter($query, array $filters)
    {
        $query->when(
            $filters['search'] ?? false,
            fn(Builder $query, $search) => $query->where('title', 'ILIKE', '%' . $search . '%')
        );

        $query->when(
            $filters['user_id'] ?? false,
            fn(Builder $query, $user_id) => $query->where('user_id', $user_id)
        );

        $query->when(
            $filters['campaign_id'] ?? false,
            fn(Builder $query, $campaign_id) => $query->where('campaign_id', $campaign_id)
        );

        $query->when(
            $filters['fund_id'] ?? false,
            fn(Builder $query, $fund_id) => $query->whereRelation('fund_id', '=', $fund_id)
        );
    }

    public function currency(): Attribute
    {
        return Attribute::make(
            get: fn($currency) => $currency ?? $this->campaign?->currency ?? $this->fund?->currency ?? CatalystCurrencies::ADA()->value,
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
            get: fn($value) => ($this->schedule?->funds_distributed ?? $value)
        );
    }

    public function quickPitchId(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->quickpitch ? collect(
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
                return "https://www.lidonation.com/en/proposals/{$this->slug}";
            }
        );
    }

    public function schedule(): HasOne|Proposal
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

    public function reviews(): HasManyThrough
    {
        return $this->hasManyThrough(
            Review::class,
            Discussion::class,
            'model_id',
            'model_id',
            'id',
            'id'
        )->where('discussions.model_type', Proposal::class);
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
        return Attribute::make(get: fn() => $this->ratings->avg('rating'));
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

        $opensourceOptionDate = new Carbon('2023-06-01');
        $opensource = (bool) $this->opensource ? 1 : 0;
        if ($this->fund?->launched_at && Carbon::make($this->fund?->launched_at)?->lessThan($opensourceOptionDate) && $opensource === 0) {
            $opensource = null;
        }

        $communities = $this->communities->map(function ($communities) {
            return [
                'id' => $communities->id,
                'title' => $communities->title,
                'status' => $communities->status,
                'content' => $communities->content,
                'user_id' => $communities->user_id,
            ];
        });

        return array_merge($array, [
            'abstain_votes_count' => $this->abstain_votes_count,
            "amount_awarded_{$this->currency}" => (bool) $this->funded_at ? ($this->amount_requested ? intval($this->amount_requested) : 0) : null,
            "amount_received_{$this->currency}" => $this->amount_received ? intval($this->amount_received) : 0,
            'amount_received' => $this->amount_received ? intval($this->amount_received) : 0,
            "amount_requested_{$this->currency}" => $this->amount_requested ? intval($this->amount_requested) : 0,
            'amount_requested' => $this->amount_requested ? intval($this->amount_requested) : 0,

            'ca_rating' => intval($this->avg_rating) ?? 0.00,
            'campaign' => [
                'id' => $this->campaign_id,
                'title' => $this->campaign?->title,
                'currency' => $this->currency,
                'proposals_count' => $this->campaign?->proposals_count,
                'amount' => $this->campaign?->amount ? intval($this->campaign?->amount) : null,
                'label' => $this->campaign?->label,
                'status' => $this->campaign?->status,
                'link' => $this->campaign?->link,
                'fund' => $this->campaign?->fund,
                'total_awarded' => $this->campaign?->total_awarded,
                'total_distributed' => $this->campaign?->total_distributed,
            ],
            'communities' => $communities->toArray(),
            "completed_amount_paid{$this->currency}" => ($this->amount_received && $this->status === 'complete') ? intval($this->amount_received) : 0,
            'completed' => $this->completed,
            'currency' => $this->currency,

            'funded' => (bool) $this->funded_at ? 1 : 0,
            'fund' => [
                'id' => $this->fund_id,
                'title' => $this->fund?->title,
                'amount' => $this->fund?->amount ? intval($this->fund?->amount) : null,
                'label' => $this->fund?->label,
                'status' => $this->fund?->status,
                'launched_at' => $this->fund?->launched_at,
                'link' => $this->fund?->link,
            ],

            'groups' => $this->groups,

            'has_quick_pitch' => (bool) $this->quickpitch ? 1 : 0,

            'ideafest_proposal' => $this->is_ideafest_proposal ? 1 : 0,
            'impact_proposal' => $this->is_impact_proposal ? 1 : 0,

            'opensource' => $opensource,
            'over_budget' => $this->status === 'over_budget' ? 1 : 0,

            'paid' => ($this->amount_received > 0) && ($this->amount_received == $this->amount_requested ? 1 : 0),

            'quickpitch' => $this->quick_pitch_id ?? null,
            'quickpitch_length' => $this->quickpitch_length ?? null,

            'ranking_total' => intval($this->ranking_total) ?? 0,
            'reviewers_total' => $this->reviewers_total,

            'tags' => $this->tags->toArray(),

            'users' => $this->team->map(function ($u) {
                $proposals = $u->proposals?->map(fn($p) => $p->toArray());

                return [
                    'id' => $u->id,
                    'hash' => $u->hash,
                    'ideascale_id' => $u->ideascale_id,
                    'username' => $u->username,
                    'name' => $u->name,
                    'bio' => $u->bio,
                    'hero_img_url' => $u->hero_img_url,
                    'proposals_completed' => $proposals?->filter(fn($p) => $p['status'] === 'complete')?->count() ?? 0,
                    'first_timer' => ($proposals?->map(fn($p) => isset($p['fund']) ? $p['fund']['id'] : null)->unique()->count() === 1),
                ];
            }),

            'woman_proposal' => $this->is_woman_proposal ? 1 : 0,
            'link' => $this->link,

            'alignment_score' => $this->meta_info->alignment_score ?? $this->getDiscussionRankingScore('Impact Alignment') ?? 0,
            'feasibility_score' => $this->meta_info->feasibility_score ?? $this->getDiscussionRankingScore('Feasibility') ?? 0,
            'auditability_score' => $this->meta_info->auditability_score ?? $this->getDiscussionRankingScore('Value for money') ?? 0,
            'projectcatalyst_io_link' => $this->meta_info?->projectcatalyst_io_url ?? null,
            'project_length' => intval($this->meta_info->project_length) ?? 0,
            'vote_casts' => intval($this->meta_info->vote_casts) ?? 0,
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

    public function team(): BelongsToMany
    {
        return $this->belongsToMany(IdeascaleProfile::class, 'ideascale_profile_has_proposal', 'proposal_id', 'ideascale_profile_id');
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(IdeascaleProfile::class, 'user_id', 'id', 'author');
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(IdeascaleProfile::class, 'ideascale_profile_has_proposal', 'proposal_id', 'ideascale_profile_id');
    }

    public function ideascaleProfiles(): BelongsToMany
    {
        return $this->belongsToMany(IdeascaleProfile::class, 'ideascale_profile_has_proposal', 'proposal_id', 'ideascale_profile_id');
    }

    /**
     * Modify the query used to retrieve models when making all the models searchable.
     */
    protected function makeAllSearchableUsing(Builder $query): Builder
    {
        return $query->with(['team', 'tags', 'groups']);
    }

    protected function casts(): array
    {
        return [
            //            'id' => HashId::class,
            'amount_received' => 'integer',
            'amount_requested' => 'integer',
            'created_at' => DateFormatCast::class,
            'currency' => CatalystCurrencies::class . ':nullable',
            'funded_at' => DateFormatCast::class,
            'funding_updated_at' => DateFormatCast::class,
            'offchain_metas' => 'array',
            'opensource' => 'boolean',
            'updated_at' => DateFormatCast::class,
            'meta_data' => 'array',
        ];
    }
}
