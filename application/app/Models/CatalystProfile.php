<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasCatalystProposers;
use App\Concerns\HasConnections;
use App\Enums\CatalystCurrencySymbols;
use App\Enums\ProposalStatus;
use App\Models\Pivot\ClaimedProfile;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Support\Facades\Log;
use Laravel\Scout\Searchable;
use Spatie\Image\Enums\CropPosition;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class CatalystProfile extends Model implements HasMedia
{
    use HasCatalystProposers, HasConnections, HasUuids, InteractsWithMedia, Searchable;

    public $guarded = [];

    protected $appends = ['hero_img_url'];

    /**
     * The profile stats that we commonly need on profile pages/cards.
     */
    protected array $profileStatAppends = [
        'proposals_count',
        'funded_proposals_count',
        'completed_proposals_count',
        'amount_requested_ada',
        'amount_requested_usd',
        'amount_awarded_ada',
        'amount_awarded_usd',
        'amount_distributed_ada',
        'amount_distributed_usd',
        'own_proposals_count',
        'collaborating_proposals_count',
    ];

    public string $meiliIndexName = 'cx_catalyst_profiles';

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

    public function claimed_profiles(): MorphMany
    {
        return $this->morphMany(ClaimedProfile::class, 'claimable');
    }

    public static function getSortableAttributes(): array
    {
        return [
            'id',
            'name',
            'username',
            'amount_awarded_ada',
            'amount_awarded_usd',
            'completed_proposals_count',
            'funded_proposals_count',
            'updated_at',
            'proposals_count',
        ];
    }

    public static function getSearchableAttributes(): array
    {
        return [
            'id',
            'name',
            'username',
        ];
    }

    public static function getFilterableAttributes(): array
    {
        return [
            'id',
            'completed_proposals_count',
            'funded_proposals_count',
            'amount_distributed_ada',
            'amount_distributed_usd',
            'amount_awarded_ada',
            'amount_awarded_usd',
            'proposals_count',
            'proposals.campaign',
            'proposals.tags',
            'proposals',
        ];
    }

    /**
     * Append the common profile stats and ensure they are loaded efficiently.
     */
    public function appendProfileStats(): self
    {
        $this->loadProfileAggregates();

        return $this->append($this->profileStatAppends);
    }

    /**
     * Load counts and currency aggregates onto the model attributes.
     */
    public function loadProfileAggregates(): self
    {
        try {
            $this->loadCount([
                'proposals',
                'proposals as funded_proposals_count' => fn ($q) => $q->whereNotNull('funded_at'),
                'proposals as completed_proposals_count' => fn ($q) => $q->where('status', ProposalStatus::complete()->value),
            ]);

            $this->loadCurrencyAggregates();
        } catch (\Throwable $e) {
            Log::warning('Failed to load CatalystProfile aggregates via relationships.', [
                'profile_id' => $this->id,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }

        // These are not yet computed elsewhere but the DTO expects them.
        $this->setAttribute('own_proposals_count', (int) ($this->attributes['own_proposals_count'] ?? 0));
        $this->setAttribute('collaborating_proposals_count', (int) ($this->attributes['collaborating_proposals_count'] ?? 0));

        return $this;
    }

    /**
     * Load currency aggregates using a single grouped query.
     */
    protected function loadCurrencyAggregates(): void
    {
        // Use the underlying builder to avoid BelongsToMany adding pivot
        // columns to the select list, which breaks GROUP BY queries.
        $rows = $this->proposals()
            ->getQuery()
            ->join('funds', 'funds.id', '=', 'proposals.fund_id')
            ->selectRaw(
                'funds.currency as currency,
                COALESCE(SUM(proposals.amount_requested), 0) as requested,
                COALESCE(SUM(CASE WHEN proposals.funded_at IS NOT NULL THEN proposals.amount_requested ELSE 0 END), 0) as awarded,
                COALESCE(SUM(CASE WHEN proposals.funded_at IS NOT NULL THEN proposals.amount_received ELSE 0 END), 0) as distributed'
            )
            ->groupBy('funds.currency')
            ->get()
            ->keyBy('currency');

        $ada = $rows->get(CatalystCurrencySymbols::ADA->name);
        $usd = $rows->get(CatalystCurrencySymbols::USD->name);

        $this->setAttribute('amount_requested_ada', (float) ($ada->requested ?? 0));
        $this->setAttribute('amount_requested_usd', (float) ($usd->requested ?? 0));
        $this->setAttribute('amount_awarded_ada', (float) ($ada->awarded ?? 0));
        $this->setAttribute('amount_awarded_usd', (float) ($usd->awarded ?? 0));
        $this->setAttribute('amount_distributed_ada', (float) ($ada->distributed ?? 0));
        $this->setAttribute('amount_distributed_usd', (float) ($usd->distributed ?? 0));
    }

    public function amountRequestedAda(): Attribute
    {
        return Attribute::make(
            get: function ($value) {
                if ($value !== null) {
                    return (float) $value;
                }

                return (float) $this->proposals()
                    ->whereHas('fund', fn ($q) => $q->where('currency', CatalystCurrencySymbols::ADA->name))
                    ->sum('amount_requested');
            },
        );
    }

    public function amountRequestedUsd(): Attribute
    {
        return Attribute::make(
            get: function ($value) {
                if ($value !== null) {
                    return (float) $value;
                }

                return (float) $this->proposals()
                    ->whereHas('fund', fn ($q) => $q->where('currency', CatalystCurrencySymbols::USD->name))
                    ->sum('amount_requested');
            },
        );
    }

    public function amountAwardedAda(): Attribute
    {
        return Attribute::make(
            get: function ($value) {
                if ($value !== null) {
                    return (float) $value;
                }

                return (float) $this->funded_proposals()
                    ->whereHas('fund', fn ($q) => $q->where('currency', CatalystCurrencySymbols::ADA->name))
                    ->sum('amount_requested');
            },
        );
    }

    public function amountAwardedUsd(): Attribute
    {
        return Attribute::make(
            get: function ($value) {
                if ($value !== null) {
                    return (float) $value;
                }

                return (float) $this->funded_proposals()
                    ->whereHas('fund', fn ($q) => $q->where('currency', CatalystCurrencySymbols::USD->name))
                    ->sum('amount_requested');
            },
        );
    }

    public function amountDistributedAda(): Attribute
    {
        return Attribute::make(
            get: function ($value) {
                if ($value !== null) {
                    return (float) $value;
                }

                return (float) $this->funded_proposals()
                    ->whereHas('fund', fn ($q) => $q->where('currency', CatalystCurrencySymbols::ADA->name))
                    ->sum('amount_received');
            },
        );
    }

    public function amountDistributedUsd(): Attribute
    {
        return Attribute::make(
            get: function ($value) {
                if ($value !== null) {
                    return (float) $value;
                }

                return (float) $this->funded_proposals()
                    ->whereHas('fund', fn ($q) => $q->where('currency', CatalystCurrencySymbols::USD->name))
                    ->sum('amount_received');
            },
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

    /**
     * Convenience methods for places that prefer explicit methods.
     */
    public function proposalsCount(): int
    {
        return isset($this->attributes['proposals_count'])
            ? (int) $this->attributes['proposals_count']
            : $this->proposals()->count();
    }

    public function fundedProposalCount(): int
    {
        return isset($this->attributes['funded_proposals_count'])
            ? (int) $this->attributes['funded_proposals_count']
            : $this->funded_proposals()->count();
    }

    public function completedProposalCount(): int
    {
        return isset($this->attributes['completed_proposals_count'])
            ? (int) $this->attributes['completed_proposals_count']
            : $this->completed_proposals()->count();
    }

    /**
     * Legacy accessors to avoid serialization errors when appending *_count
     * attributes in older parts of the codebase.
     */
    public function getProposalsCountAttribute($value): int
    {
        return $value !== null ? (int) $value : $this->proposalsCount();
    }

    public function getFundedProposalsCountAttribute($value): int
    {
        return $value !== null ? (int) $value : $this->fundedProposalCount();
    }

    public function getCompletedProposalsCountAttribute($value): int
    {
        return $value !== null ? (int) $value : $this->completedProposalCount();
    }

    public function getOwnProposalsCountAttribute($value): int
    {
        return $value !== null
            ? (int) $value
            : (int) ($this->attributes['own_proposals_count'] ?? 0);
    }

    public function getCollaboratingProposalsCountAttribute($value): int
    {
        return $value !== null
            ? (int) $value
            : (int) ($this->attributes['collaborating_proposals_count'] ?? 0);
    }

    public function toSearchableArray(): array
    {
        $this->loadProfileAggregates();

        $array = $this->toArray();

        return array_merge($array, [
            'hero_img_url' => $this->hero_img_url,
            'proposals_count' => $this->proposalsCount(),
            'funded_proposals_count' => $this->fundedProposalCount(),
            'completed_proposals_count' => $this->completedProposalCount(),
            'amount_requested_ada' => $this->amount_requested_ada,
            'amount_requested_usd' => $this->amount_requested_usd,
            'amount_awarded_ada' => $this->amount_awarded_ada,
            'amount_awarded_usd' => $this->amount_awarded_usd,
            'amount_distributed_ada' => $this->amount_distributed_ada,
            'amount_distributed_usd' => $this->amount_distributed_usd,
        ]);
    }

    public function registerMediaConversions(?Media $media = null): void
    {
        $this->addMediaConversion('thumbnail')
            ->width(150)
            ->height(150)
            ->withResponsiveImages()
            ->crop(150, 150, CropPosition::Top)
            ->performOnCollections('profile');

        $this->addMediaConversion('large')
            ->width(1080)
            ->height(1350)
            ->crop(1080, 1350, CropPosition::Top)
            ->withResponsiveImages()
            ->performOnCollections('profile');
    }
}
