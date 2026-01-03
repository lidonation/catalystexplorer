<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasAuthor;
use App\Concerns\HasConnections;
use App\Concerns\HasDto;
use App\Concerns\HasMetaData;
use App\Concerns\HasSignatures;
use App\Concerns\HasTaxonomies;
use App\Concerns\HasTranslations;
use App\Contracts\IHasMetaData;
use App\Enums\CatalystCurrencies;
use App\Models\Pivot\ProposalProfile;
use App\Models\Scopes\ProposalTypeScope;
use App\Services\VideoService;
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
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Laravel\Scout\Searchable;
use Spatie\Comments\Models\Concerns\HasComments;
use Staudenmeir\EloquentHasManyDeep\HasRelationships;

#[ScopedBy(ProposalTypeScope::class)]
class Proposal extends Model implements IHasMetaData
{
    use HasAuthor,
        HasComments,
        HasConnections,
        HasConnections,
        HasDto,
        HasMetaData,
        HasRelationships,
        HasSignatures,
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

    protected $with = [
        //        'metas'
    ];

    protected $appends = [
        'link',
        'currency',
        'quickpitch_thumbnail',
        'is_claimed',
    ];

    public $meiliIndexName = 'cx_proposals';

    public static function getFilterableAttributes(): array
    {
        return [
            'id',
            'funded',
            'completed',
            'currency',
            'claimed_catalyst_profiles.id',
            'claimed_ideascale_profiles.id',
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
            'amount_requested_USDM',
            'amount_requested_ADA',
            'amount_received_ADA',
            'amount_received_USD',
            'amount_received_USDM',
            'amount_awarded_ADA',
            'amount_awarded_USD',
            'amount_awarded_USDM',
            'completed_amount_paid_USDM',
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

    /**
     * Scope for selecting only fields needed for QuickPitch components
     */
    public function scopeForQuickPitch($query)
    {
        return $query->select([
            'proposals.id',
            'proposals.title',
            'proposals.quickpitch',
            'proposals.amount_received',
            'proposals.amount_requested',
            'proposals.currency',
            'proposals.slug',
            'proposals.fund_id',
            'proposals.campaign_id',
        ]);
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
            fn (Builder $query, $fund_id) => $query->where('fund_id', $fund_id)
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

    public function amountRequestedUsd(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->currency === CatalystCurrencies::USD()->value
                ? intval($this->amount_requested ?? 0)
                : 0
        );
    }

    public function amountRequestedUsdm(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->currency === CatalystCurrencies::USDM()->value
                ? intval($this->amount_requested ?? 0)
                : 0
        );
    }

    public function amountRequestedAda(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->currency === CatalystCurrencies::ADA()->value
                ? intval($this->amount_requested ?? 0)
                : 0
        );
    }

    public function amountReceived(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => ($this->schedule?->funds_distributed ?? $value)
        );
    }

    public function amountReceivedUsd(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->currency === CatalystCurrencies::USD()->value
                ? intval($this->amount_received ?? 0)
                : 0
        );
    }

    public function amountReceivedUsdm(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->currency === CatalystCurrencies::USDM()->value
                ? intval($this->amount_received ?? 0)
                : 0
        );
    }

    public function amountReceivedAda(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->currency === CatalystCurrencies::ADA()->value
                ? intval($this->amount_received ?? 0)
                : 0
        );
    }

    public function amountAwardedUsd(): Attribute
    {
        return Attribute::make(
            get: fn () => ($this->funded_at && $this->currency === CatalystCurrencies::USD()->value)
                ? intval($this->amount_requested ?? 0)
                : 0
        );
    }

    public function amountAwardedUsdm(): Attribute
    {
        return Attribute::make(
            get: fn () => ($this->funded_at && $this->currency === CatalystCurrencies::USDM()->value)
                ? intval($this->amount_requested ?? 0)
                : 0
        );
    }

    public function amountAwardedAda(): Attribute
    {
        return Attribute::make(
            get: fn () => ($this->funded_at && $this->currency === CatalystCurrencies::ADA()->value)
                ? intval($this->amount_requested ?? 0)
                : 0
        );
    }

    public function catalystDocumentId(): Attribute
    {
        return Attribute::make(
            get: function ($value) {
                return $this->meta_info?->catalyst_document_id ?? null;
            }
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

    public function quickpitchThumbnail(): Attribute
    {
        return Attribute::make(
            get: function () {
                try {
                    $metadata = app(VideoService::class)->getVideoMetadata($this->quickpitch);

                    if ($metadata && empty($metadata->thumbnail)) {
                        Log::debug('Quickpitch video metadata (no thumbnail):', (array) $metadata);
                    }

                    return $metadata['thumbnail'] ?? null;
                } catch (\Exception $e) {
                    Log::warning('Failed to fetch quickpitch thumbnail', [
                        'proposal_id' => $this->id,
                        'quickpitch_url' => $this->quickpitch,
                        'error' => $e->getMessage(),
                    ]);

                    return null;
                }
            }
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
            'model_id',
            'model_id',
            'id',
            'id'
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
        $this->load(['fund', 'communities', 'catalyst_profiles', 'ideascale_profiles']);

        return array_merge($array, [
            'funded' => (bool) $this->funded_at ? 1 : 0,
            'currency' => $this->currency,
            'amount_requested' => $this->amount_requested ? intval($this->amount_requested) : 0,
            'amount_received' => $this->amount_received ? intval($this->amount_received) : 0,
            'amount_requested_USD' => $this->amount_requested_usd,
            'amount_requested_USDM' => $this->amount_requested_usdm,
            'amount_requested_ADA' => $this->amount_requested_ada,
            'amount_received_USD' => $this->amount_received_usd,
            'amount_received_USDM' => $this->amount_received_usdm,
            'amount_received_ADA' => $this->amount_received_ada,
            'amount_awarded_USDM' => $this->amount_awarded_usdm,
            'amount_awarded_USD' => $this->amount_awarded_usd,
            'amount_awarded_ADA' => $this->amount_awarded_ada,
            'link' => $this->link,
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
            'catalyst_profiles' => $this->catalyst_profiles->map(fn ($profile) => [
                'id' => $profile->id,
                'name' => $profile->name,
                'claimed_by' => $profile->claimed_by,
                'username' => $profile->username,
                'catalyst_id' => $profile->catalyst_id,
            ]),
            'claimed_catalyst_profiles' => $this->catalyst_profiles
                ->filter(fn ($profile) => ! is_null($profile->claimed_by))
                ->map(fn ($profile) => [
                    'id' => $profile->id,
                    'name' => $profile->name,
                    'claimed_by' => $profile->claimed_by,
                    'username' => $profile->username,
                    'catalyst_id' => $profile->catalyst_id,
                ]),
            'claimed_ideascale_profiles' => $this->ideascale_profiles
                ->filter(fn ($profile) => ! is_null($profile->claimed_by_uuid))
                ->map(fn ($profile) => [
                    'id' => $profile->id,
                    'name' => $profile->name,
                    'claimed_by_uuid' => $profile->claimed_by_uuid,
                    'username' => $profile->username,
                    'ideascale_id' => $profile->ideascale_id,
                ]),
            // Convenience fields for searching claimed profiles
            'claimed_profile_ids' => array_merge(
                $this->catalyst_profiles->filter(fn ($p) => ! is_null($p->claimed_by))->pluck('id')->toArray(),
                $this->ideascale_profiles->filter(fn ($p) => ! is_null($p->claimed_by_uuid))->pluck('id')->toArray()
            ),
            'claimed_catalyst_profile_ids' => $this->catalyst_profiles
                ->filter(fn ($profile) => ! is_null($profile->claimed_by))
                ->pluck('id')
                ->toArray(),
            'claimed_ideascale_profile_ids' => $this->ideascale_profiles
                ->filter(fn ($profile) => ! is_null($profile->claimed_by_uuid))
                ->pluck('id')
                ->toArray(),
        ]);
    }

    public function meta_data(): HasMany
    {
        return $this->metas();
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

    public function catalyst_profiles()
    {
        return $this->belongsToMany(CatalystProfile::class, 'proposal_profiles', 'proposal_id', 'profile_id')
            ->where('profile_type', CatalystProfile::class);
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

    public function links(): BelongsToMany
    {
        return $this->belongsToMany(Link::class, 'model_links', 'model_id', 'link_id', 'id', 'id')
            ->withPivot('model_type')
            ->wherePivot('model_type', static::class);
    }

    public function catalyst_tallies(): HasMany
    {
        return $this->hasMany(CatalystTally::class, 'model_id', 'id')
            ->where('model_type', static::class);
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

    /**
     * //@todo Refactor this to be more efficient using withCount or something.
     */
    public function isClaimed(): Attribute
    {
        return Attribute::make(
            get: function () {
                $teamMembers = $this->team;

                if ($teamMembers->isEmpty()) {
                    return false;
                }

                foreach ($teamMembers as $teamMember) {
                    $profile = $teamMember->model;

                    if (! $profile) {
                        continue;
                    }

                    if (method_exists($profile, 'claimed_by_users')) {
                        $claimedUsersCount = $profile->claimed_by_users()->count();

                        if ($claimedUsersCount === 0) {
                            return false;
                        }
                    } else {
                        return false;
                    }
                }

                return true;
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
        return $query; // Removed ->with(['tags', 'groups'])
    }

    protected function casts(): array
    {
        return [
            //            'id' => HashId::class,
            'amount_received' => 'integer',
            'amount_requested' => 'integer',
            'created_at' => 'datetime',
            'currency' => CatalystCurrencies::class.':nullable',
            'funded_at' => 'datetime',
            'funding_updated_at' => 'datetime',
            'offchain_metas' => 'array',
            'opensource' => 'boolean',
            'updated_at' => 'datetime',
            'meta_data' => 'array',
        ];
    }
}
