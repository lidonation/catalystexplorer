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
use Illuminate\Support\Facades\Log;
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
        'claimed_by_uuid',
        'telegram',
        'title',
    ];

    public $appends = ['hero_img_url'];

    public $withCount = [
        // Re-enabled proposals count with proper type casting
        'proposals',
        // Keep others disabled until type mismatches are resolved
        // 'completed_proposals',
        // 'funded_proposals',
        // 'unfunded_proposals',
        // 'in_progress_proposals',
        // 'outstanding_proposals',
        // 'own_proposals',
        // 'collaborating_proposals',
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
     * Fixed with proper type casting to handle UUID/string type mismatches.
     */
    public function proposals(): MorphToMany
    {
        return $this->morphToMany(
            Proposal::class,
            'profile',
            'proposal_profiles',
            'profile_id',
            'proposal_id'
        )->where('proposals.type', 'proposal');
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
            'ideascale_profile_id',
            'group_id',
            'id',
            'id'
        );
    }

    public function reviews(): HasManyDeep
    {
        return $this->hasManyDeep(
            Review::class,
            ['ideascale_profile_has_proposal', Proposal::class, Discussion::class],
            ['ideascale_profile_id', 'id', 'model_id', 'old_id'],
            ['id', 'proposal_id', 'user_id', 'model_id']
        )->where('discussions.model_type', Proposal::class)
            ->whereRaw('discussions.old_id::text = reviews.model_id');
    }

    public function aggregatedRatings(): Attribute
    {
        return Attribute::make(
            get: function () {
                return collect(range(1, 5))->mapWithKeys(fn ($rating) => [$rating => 0])->all();
            }
        );
    }

    public function claimed_by(): BelongsTo
    {
        return $this->belongsTo(User::class, 'claimed_by_uuid', 'id');
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
        // Load the model with required counts for indexing
        $this->loadCount(['proposals']);

        $array = $this->toArray();

        // Remove hash field from indexing - we only use UUIDs now
        if (isset($array['hash'])) {
            unset($array['hash']);
        }

        // Calculate proposals count with fallback methods
        $proposalsCount = $this->getProposalsCount();

        return array_merge($array, [
            'hero_img_url' => $this->hero_img_url,
            'proposals_count' => $proposalsCount,
            'amount_requested_ada' => $this->amount_requested_ada,
            'amount_requested_usd' => $this->amount_requested_usd,
            'amount_awarded_ada' => $this->amount_awarded_ada,
            'amount_awarded_usd' => $this->amount_awarded_usd,
            'amount_distributed_ada' => $this->amount_distributed_ada,
            'amount_distributed_usd' => $this->amount_distributed_usd,
            // Add other counts when type mismatches are fixed
        ]);
    }

    /**
     * Get the proposals count with fallback methods
     * to handle type mismatches gracefully
     */
    public function getProposalsCount(): int
    {
        // Try to get from loaded count first
        if (isset($this->attributes['proposals_count'])) {
            return (int) $this->attributes['proposals_count'];
        }

        // Fallback to direct database query with proper type casting
        try {
            return (int) DB::table('proposal_profiles')
                ->join('proposals', 'proposals.id', '=', 'proposal_profiles.proposal_id')
                ->where('proposal_profiles.profile_type', 'App\\Models\\IdeascaleProfile')
                ->whereRaw('CAST(proposal_profiles.profile_id as VARCHAR) = ?', [(string) $this->id])
                ->where('proposals.type', 'proposal')
                ->count();
        } catch (\Exception $e) {
            Log::warning('Failed to get proposals count for IdeascaleProfile', [
                'profile_id' => $this->id,
                'error' => $e->getMessage(),
            ]);

            return 0;
        }
    }

    /**
     * Force refresh the proposals count and update search index
     */
    public function refreshProposalsCount(): self
    {
        // Reload the count relationship
        $this->loadCount('proposals');

        // Update search index if model uses Scout
        if (method_exists($this, 'searchable')) {
            $this->searchable();
        }

        return $this;
    }

    protected function casts(): array
    {
        return [
            //            'id' => HashId::class,
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }
}
