<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\CatalystCurrencySymbols;
use App\Enums\ProposalStatus;
use App\Traits\HasConnections;
use App\Traits\HasTaxonomies;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Laravel\Scout\Searchable;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Staudenmeir\EloquentHasManyDeep\HasManyDeep;
use Staudenmeir\EloquentHasManyDeep\HasRelationships;

class Community extends Model implements HasMedia
{
    use HasConnections, HasRelationships, HasTaxonomies, HasUuids, InteractsWithMedia, Searchable;

    protected $appends = [];

    public $meiliIndexName = 'cx_communities';

    public static function getFilterableAttributes(): array
    {
        return [
            'id',
            'status',
            'user_id',
            'slug',
            'created_at',
            'updated_at',
        ];
    }

    public static function getSearchableAttributes(): array
    {
        return [
            'title',
            'content',
            'slug',
        ];
    }

    public static function getSortableAttributes(): array
    {
        return [
            'id',
            'title',
            'status',
            'slug',
            'created_at',
            'updated_at',
        ];
    }

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    /**
     * Scope to filter groups
     */
    public function scopeFilter(Builder $query, array $filters): Builder
    {
        $query->when($filters['search'] ?? null, function ($query, $search) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'ilike', "%{$search}%")
                    ->orWhere('id', 'like', "%{$search}%");
            });
        })->when($filters['ids'] ?? null, function ($query, $ids) {
            $query->whereIn('id', is_array($ids) ? $ids : explode(',', $ids));
        });

        $query->when(! empty($filters['sort']), function ($query) use ($filters) {
            [$column, $direction] = explode(':', $filters['sort']);
            $query->orderBy($column, $direction);
        });

        $query->when(! empty($filters['cohort']), function ($query, $cohort) use ($filters) {
            $query->whereHas('proposals.metas', function ($q) use ($filters) {
                $q->whereIn('key', $filters['cohort'])
                    ->where('content', true);
            })->get();
        });

        return $query;
    }

    public function amountAwardedAda(): Attribute
    {
        return Attribute::make(
            get: function () {
                return $this->funded_proposals()
                    ->whereHas('fund', function ($q) {
                        $q->where('currency', CatalystCurrencySymbols::ADA->name);
                    })->sum('amount_requested');
            },
        );
    }

    public function amountAwardedUsd(): Attribute
    {
        return Attribute::make(
            get: function () {
                $amount = $this->funded_proposals()
                    ->whereHas('fund', function ($q) {
                        $q->where('currency', CatalystCurrencySymbols::USD->name);
                    })->sum('amount_requested');

                return $amount;
            },
        );
    }

    public function amountDistributedAda(): Attribute
    {
        return Attribute::make(
            get: function () {
                return $this->funded_proposals()
                    ->whereHas('fund', function ($q) {
                        $q->where('currency', CatalystCurrencySymbols::ADA->name);
                    })->sum('amount_received');
            },
        );
    }

    public function amountDistributedUsd(): Attribute
    {
        return Attribute::make(
            get: function () {
                return $this->funded_proposals()
                    ->whereHas('fund', function ($q) {
                        $q->where('currency', CatalystCurrencySymbols::USD->name);
                    })->sum('amount_received');
            },
        );
    }

    public function proposals(): BelongsToMany
    {
        return $this->belongsToMany(Proposal::class, 'community_has_proposal', 'community_id', 'proposal_id', 'id', 'id', 'proposals');
    }

    public function reviews(): HasManyDeep
    {
        return $this->hasManyDeepFromRelations($this->proposals(), (new Proposal)->reviews());
    }

    public function funded_proposals(): BelongsToMany
    {
        return $this->proposals()
            ->where(['type' => 'proposal'])
            ->whereNotNull('funded_at');
    }

    public function completed_proposals(): BelongsToMany
    {
        return $this->proposals()
            ->where(['type' => 'proposal', 'status' => ProposalStatus::complete()->value]);
    }

    public function unfunded_proposals(): BelongsToMany
    {
        return $this->proposals()
            ->where('type', 'proposal')
            ->whereNull('funded_at');
    }

    public function ideascale_profiles(): HasManyDeep
    {
        return $this->hasManyDeepFromRelationsWithConstraints([$this, 'proposals'], [new Proposal, 'users'])
            ->groupBy(['ideascale_profiles.id', 'community_has_proposal.community_id']);
    }

    public function user(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'community_has_users', 'community_id', 'user_uuid', 'id', 'id');
    }

    public function groups(): HasManyDeep
    {
        return $this->hasManyDeepFromRelationsWithConstraints([$this, 'proposals'], [new Proposal, 'groups'])
            ->groupBy(['groups.id', 'community_has_proposal.community_id']);
    }

    public function toSearchableArray(): array
    {
        // $this->loadMissing([
        //     'groups',
        //     'ideascale_profiles',
        //     'reviews',
        // ]);

        $this->loadCount([
            'unfunded_proposals',
            'completed_proposals',
            'funded_proposals', 'proposals', 'ideascale_profiles',
            // 'users', // Temporarily commented out to fix UUID/bigint issue
        ]);

        $array = $this->toArray();

        // Remove hash field from indexing - we only use UUIDs now
        if (isset($array['hash'])) {
            unset($array['hash']);
        }

        return $array;
    }
}
