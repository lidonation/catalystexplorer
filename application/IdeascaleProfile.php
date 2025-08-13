<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\CatalystCurrencySymbols;
use App\Enums\ProposalStatus;
use App\Traits\HasConnections;
use App\Traits\HasMetaData;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphToMany;
use Illuminate\Support\Facades\DB;
use Laravel\Scout\Searchable;
use Laravolt\Avatar\Facade as Avatar;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\Translatable\HasTranslations;
use Staudenmeir\EloquentHasManyDeep\HasManyDeep;
use Staudenmeir\EloquentHasManyDeep\HasRelationships;

// #[ScopedBy(new LimitScope(64))]
class IdeascaleProfile extends Model implements HasMedia
{
    use HasConnections, HasMetaData, HasRelationships, HasTranslations, HasUuids, InteractsWithMedia, Searchable;

    public int $maxValuesPerFacet = 8000;

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<string>
     */
    protected $hidden = [];

    protected $fillable = [
        'ideascale_id',
        'username',
        'email',
        'name',
        'bio',
        'created_at',
        'updated_at',
        'twitter',
        'linkedin',
        'discord',
        'ideascale',
        'claimed_by',
        'telegram',
        'title',
    ];

    public $appends = ['hero_img_url'];

    public $withCount = [
        // Temporarily disabled problematic counts due to UUID/bigint type mismatch
        // 'completed_proposals',
        // 'funded_proposals',
        // 'unfunded_proposals',
        // 'in_progress_proposals',
        // 'outstanding_proposals',
        // 'own_proposals',
        // 'collaborating_proposals',
        'proposals',
        // 'reviews', // Temporarily disabled due to bigint/text type mismatch in review->discussion join
    ];

    public array $translatable = [
        // 'bio',
    ];

    public $meiliIndexName = 'cx_ideascale_profiles';

    public static function getSortableAttributes(): array
    {
        return [
            'id',
            'name',
            'username',
            'email',
            'amount_awarded_ada',
            'amount_awarded_usd',
            'completed_proposals_count',
            'funded_proposals_count',
            'unfunded_proposals_count',
            'in_progress_proposals_count',
            'outstanding_proposals_count',
            'updated_at',
            'own_proposals_count',
            'collaborating_proposals_count',
            'co_proposals_count',
            'proposals_count',
        ];
    }

    public static function getSearchableAttributes(): array
    {
        return [
            'id',
            'name',
            'username',
            'bio',
            'email',
            'proposals_total_amount_requested',
        ];
    }

    public static function getFilterableAttributes(): array
    {
        return [
            'id',
            'completed_proposals_count',
            'funded_proposals_count',
            'unfunded_proposals_count',
            'in_progress_proposals_count',
            'outstanding_proposals_count',
            'own_proposals_count',
            'collaborating_proposals_count',
            'proposals_count',
            'claimed_by_uuid',
            'first_timer',
            'proposals.campaign',
            'proposals.impact_proposal',
            'amount_distributed_ada',
            'amount_distributed_usd',
            'collaborating_proposals',
            'proposals.tags',
            'proposals',
            'proposals_total_amount_requested',
            'proposals.is_co_proposer',
            'proposals.is_primary_proposer',

            'amount_awarded_ada',
            'amount_awarded_usd',
        ];
    }

    public function amountRequestedAda(): Attribute
    {
        return Attribute::make(
            get: function () {
                return $this->proposals()
                    ->whereHas('fund', fn ($q) => $q->where('currency', CatalystCurrencySymbols::ADA->name))
                    ->sum('amount_requested');
            },
        );
    }

    public function amountRequestedUsd(): Attribute
    {
        return Attribute::make(
            get: function () {
                return $this->proposals()
                    ->whereHas('fund', fn ($q) => $q->where('currency', CatalystCurrencySymbols::USD->name))
                    ->sum('amount_requested');
            },
        );
    }

    public function amountAwardedAda(): Attribute
    {
        return Attribute::make(
            get: function () {
                return $this->proposals()
                    ->whereHas('fund', fn ($q) => $q->where('currency', CatalystCurrencySymbols::ADA->name))
                    ->whereNotNull('funded_at')
                    ->sum('amount_requested');
            },
        );
    }

    public function amountAwardedUsd(): Attribute
    {
        return Attribute::make(
            get: function () {
                return $this->proposals()
                    ->whereHas('fund', fn ($q) => $q->where('currency', CatalystCurrencySymbols::USD->name))
                    ->whereNotNull('funded_at')
                    ->sum('amount_requested');
            },
        );
    }

    public function amountDistributedAda(): Attribute
    {
        return Attribute::make(
            get: function () {
                return $this->proposals()
                    ->whereHas('fund', fn ($q) => $q->where('currency', CatalystCurrencySymbols::ADA->name))
                    ->whereNotNull('funded_at')
                    ->sum('amount_received');
            },
        );
    }

    public function amountDistributedUsd(): Attribute
    {
        return Attribute::make(
            get: function () {
                return $this->proposals()
                    ->whereHas('fund', fn ($q) => $q->where('currency', CatalystCurrencySymbols::USD->name))
                    ->whereNotNull('funded_at')
                    ->sum('amount_received');
            },
        );
    }

    public function gravatar(): Attribute
    {
        return Attribute::make(
            get: fn () => Avatar::create($this->username ?? $this->name ?? 'default')->toGravatar()
        );
    }

    public function heroImgUrl(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->getFirstMediaUrl('profile') ?? $this->gravatar
        );
    }

    public function completed_proposals(): BelongsToMany
    {
        return $this->proposals()
            ->where(['type' => 'proposal', 'status' => ProposalStatus::complete()->value]);
    }

    public function funded_proposals(): BelongsToMany
    {
        return $this->proposals()
            ->where('type', 'proposal')
            ->whereNotNull('funded_at');
    }

    public function unfunded_proposals(): BelongsToMany
    {
        return $this->proposals()
            ->where('type', 'proposal')
            ->whereNull('funded_at');
    }

    public function in_progress_proposals(): BelongsToMany
    {
        return $this->proposals()
            ->where(['type' => 'proposal', 'status' => 'in_progress']);
    }

    public function proposal_schedules()
    {
        return $this->hasManyDeep(ProjectSchedule::class, ['ideascale_profile_has_proposal', Proposal::class], ['ideascale_profile_id', 'id'], ['id', 'proposal_id']);
    }

    public function monthly_reports(): HasMany
    {
        return $this->hasMany(MonthlyReport::class);
    }

    public function outstanding_proposals(): BelongsToMany
    {
        return $this->proposals()
            ->where('type', 'proposal')
            ->whereNotNull('funded_at')
            ->where('status', '!=', 'complete');
    }

    public function own_proposals(): HasMany
    {
        // Temporarily disabled due to UUID/bigint type mismatch
        // return $this->hasMany(Proposal::class, 'user_id', 'id')
        //     ->where('type', 'proposal');
        // Return empty relationship for now
        return $this->hasMany(Proposal::class, 'nonexistent_field', 'id')
            ->where('1', '=', '0'); // Always empty
    }

    public function collaborating_proposals(): BelongsToMany
    {
        return $this->proposals()
            ->where('type', 'proposal')
            ->whereIn('proposal_id', function ($q) {
                $q->select('proposal_id')
                    ->from('ideascale_profile_has_proposal')
                    ->where('ideascale_profile_id', $this->id);
            })->where('type', 'proposal')
            ->where('user_id', '!=', $this->id);
    }

    //  public function proposals(): BelongsToMany
    //    {
    //        return $this->belongsToMany(
    //            Proposal::class,
    //            'ideascale_profile_has_proposal',
    //            'ideascale_profile_id',
    //            'proposal_id'
    //        )->where('type', 'proposal');
    //    }

    /**
     * Get all proposals using the polymorphic relationship.
     */
    public function proposals(): MorphToMany
    {
        return $this->morphToMany(
            Proposal::class,
            'profile',
            'proposal_profiles',
            'profile_id',
            'proposal_id'
        )->where('type', 'proposal');
    }

    public function groups(): BelongsToMany
    {
        return $this->belongsToMany(
            Group::class,
            'group_has_ideascale_profile',
            'ideascale_profile_id',
            'group_id'
        );
    }

    public function groupsUuid(): BelongsToMany
    {
        return $this->belongsToMany(
            Group::class,
            'group_has_ideascale_profile',
            'ideascale_profile_uuid',
            'group_uuid',
            'uuid',
            'uuid'
        );
    }

    public function reviews(): HasManyDeep
    {
        return $this->hasManyDeepFromRelations($this->proposals(), (new Proposal)->reviews());
    }

    public function aggregatedRatings(): Attribute
    {
        return Attribute::make(
            get: function () {
                $proposalIds = $this->proposals()->pluck('proposals.id');

                if ($proposalIds->isEmpty()) {
                    return collect(range(1, 5))->mapWithKeys(fn ($rating) => [$rating => 0])->all();
                }

                $ratingsQuery = DB::table('ratings')
                    ->select('ratings.rating', DB::raw('COUNT(*) as count'))
                    ->join('reviews', 'reviews.id', '=', 'ratings.review_id')
                    ->join('discussions', DB::raw('CAST(reviews.model_id AS BIGINT)'), '=', 'discussions.id')
                    ->whereIn('discussions.model_id', $proposalIds)
                    ->where('discussions.model_type', Proposal::class)
                    ->groupBy('ratings.rating');

                $ratings = $ratingsQuery->pluck('count', 'rating')->toArray();

                return collect(range(1, 5))
                    ->mapWithKeys(fn ($rating) => [$rating => $ratings[$rating] ?? 0])
                    ->all();
            }
        );
    }

    public function claimed_by(): BelongsTo
    {
        return $this->belongsTo(User::class, 'claimed_by_uuid', 'id');
    }

    public function claimedByUuid(): BelongsTo
    {
        return $this->belongsTo(User::class, 'claimed_by_uuid', 'uuid');
    }

    public function nfts(): HasMany
    {
        return $this->hasMany(Nft::class, 'model_id', 'id')
            ->where('model_type', static::class);
    }

    /**
     * Scope to filter groups
     */
    public function scopeFilter(Builder $query, array $filters): Builder
    {
        $idsFromHash = ! empty($filters['hashes']) ? (array) $filters['hashes'] : [];

        $ids = ! empty($filters['ids']) ? array_merge((array) $filters['ids'], $idsFromHash) : $idsFromHash;

        $query->when($filters['search'] ?? null, function ($query, $search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                    ->orWhere('id', 'like', "%{$search}%")
                    ->orWhere('username', 'ilike', "%{$search}%");
            });
        })->when(! empty($ids), function ($query) use ($ids) {
            $query->whereIn('id', $ids);
        });

        return $query;
    }

    public function toSearchableArray(): array
    {
        // Temporarily simplified to avoid problematic relationship loading
        $array = $this->toArray();

        // Remove hash field from indexing - we only use UUIDs now
        if (isset($array['hash'])) {
            unset($array['hash']);
        }

        // Basic indexable data without problematic relationships for now
        return array_merge($array, [
            'hero_img_url' => $this->hero_img_url,
            'proposals_count' => $this->proposals_count ?? 0,
            // Temporarily omit other problematic counts until relationships are fixed
        ]);
    }

    protected function casts(): array
    {
        return [
            //            'id' => HashId::class,
            // 'claimed_by_uuid' => HashId::class,
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }
}
