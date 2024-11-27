<?php declare(strict_types=1);

namespace App\Models;

use App\Models\Fund;
use App\Models\Group;
use App\Models\Model;
use App\Models\Campaign;
use App\Models\Community;
use App\Traits\HasAuthor;
use App\Casts\DateFormatCast;
use App\Traits\HasTaxonomies;
use Laravel\Scout\Searchable;
use Illuminate\Support\Carbon;
use App\Traits\HasTranslations;
use App\Models\IdeascaleProfile;
use App\Enums\CatalystCurrencies;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Proposal extends Model
{
    use HasTranslations,
        HasAuthor,
        Searchable,
        HasTaxonomies;

    public array $translatable = [
        'title',
        'meta_title',
        'problem',
        'solution',
        'experience',
        'content',
    ];

    public $translatableExcludedFromGeneration = [
        'meta_title',
    ];

    protected $guarded = ['user_id', 'created_at', 'funded_at'];

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
        Artisan::call('cx:create-search-index App\\\\Models\\\\Proposal cx_proposals');
    }

    public function scopeFilter($query, array $filters)
    {
        $query->when(
            $filters['search'] ?? false,
            fn (Builder $query, $search) => $query->where('title', 'ILIKE', '%'.$search.'%')
        );

        $query->when(
            $filters['user_id'] ?? false,
            fn (Builder $query, $user_id) => $query->where('user_id', $user_id)
        );

        $query->when(
            $filters['challenge_id'] ?? false,
            fn (Builder $query, $challenge_id) => $query->where('campaign_id', $challenge_id)
        );

        $query->when(
            $filters['fund_id'] ?? false,
            fn (Builder $query, $fund_id) => $query->whereRelation('fund', 'id', '=', $fund_id)
        );
    }

    public function currency(): Attribute
    {
        return Attribute::make(
            get: fn ($currency) => $currency ?? $this->campaign?->currency ?? $this->fund?->currency ?? CatalystCurrencies::USD()->value,
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

    /**
     * Get the value used to index the model.
     */
    public function getScoutKey(): mixed
    {
        return $this->id;
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
//            'alignment_score' => $this->meta_info->alignment_score ?? $this->getDiscussionRankingScore('Impact Alignment') ?? 0,
            "amount_awarded_{$this->currency}" => (bool) $this->funded_at ? ($this->amount_requested ? intval($this->amount_requested) : 0) : null,
            "amount_received_{$this->currency}" => $this->amount_received ? intval($this->amount_received) : 0,
            'amount_received' => $this->amount_received ? intval($this->amount_received) : 0,
            "amount_requested_{$this->currency}" => $this->amount_requested ? intval($this->amount_requested) : 0,
            'amount_requested' => $this->amount_requested ? intval($this->amount_requested) : 0,

//            'auditability_score' => $this->meta_info->auditability_score ?? $this->getDiscussionRankingScore('Value for money') ?? 0,

            'ca_rating' => intval($this->ratings_average) ?? 0.00,
            'campaign' => [
                'id' => $this->campaign?->id,
                'title' => $this->campaign?->title,
                'amount' => $this->campaign?->amount ? intval($this->campaign?->amount) : null,
                'label' => $this->campaign?->label,
                'status' => $this->campaign?->status,
                'link' => $this->campaign?->link,
                'fund' => $this->campaign?->fund,
            ],
            'communities' => $communities->toArray(),
            "completed_amount_paid{$this->currency}" => ($this->amount_received && $this->status === 'complete') ? intval($this->amount_received) : 0,
            'completed' => $this->status === 'complete' ? 1 : 0,
            'currency' => $this->currency,

//            'feasibility_score' => $this->meta_info->feasibility_score ?? $this->getDiscussionRankingScore('Feasibility') ?? 0,
            'funded' => (bool) $this->funded_at ? 1 : 0,
            'fund' => [
                'id' => $this->fund?->id,
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
            'project_length' => intval($this->meta_info?->project_length) ?? 0,
            'projectcatalyst_io_link' => $this->meta_info?->projectcatalyst_io_url ?? null,

            'quickpitch' => $this->quickpitch ?? null,
            'quickpitch_length' => $this->quickpitch_length ?? null,

            'ranking_total' => intval($this->ranking_total) ?? 0,
            'reviewers_total' => $this->reviewers_total,

            'tags' => $this->tags->toArray(),

            'users' => $this->team->map(function ($u) {
                $proposals = $u->proposals?->map(fn ($p) => $p->toArray());

                return [
                    'id' => $u->id,
                    'ideascale_id' => $u->ideascale_id,
                    'username' => $u->username,
                    'name' => $u->name,
                    'bio' => $u->bio,
                    'profile_photo_url' => $u->media?->isNotEmpty() ? $u->thumbnail_url : $u->profile_photo_url,
                    'proposals_completed' => $proposals?->filter(fn ($p) => $p['status'] === 'complete')?->count() ?? 0,
                    'first_timer' => ($proposals?->map(fn ($p) => isset($p['fund']) ? $p['fund']['id'] : null)->unique()->count() === 1),
                ];
            }),

            'vote_casts' => intval($this->meta_info?->vote_casts) ?? 0,

            'woman_proposal' => $this->is_woman_proposal ? 1 : 0,
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
        return $this->belongsToMany(IdeascaleProfile::class,'ideascale_profile_has_proposal', 'proposal_id', 'ideascale_profile_id');
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
            'amount_received' => 'integer',
            'amount_requested' => 'integer',
            'created_at' => DateFormatCast::class,
            'currency' => CatalystCurrencies::class,
            'funded_at' => DateFormatCast::class,
            'funding_updated_at' => DateFormatCast::class,
            'offchain_metas' => 'array',
            'opensource' => 'boolean',
            'updated_at' => DateFormatCast::class,
            'meta_data'=> 'array'
        ];
    }
}
