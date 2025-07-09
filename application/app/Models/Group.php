<?php

declare(strict_types=1);

namespace App\Models;

use App\Actions\TransformHashToIds;
use App\Enums\CatalystCurrencySymbols;
use App\Enums\ProposalStatus;
use App\Traits\HasConnections;
use App\Traits\HasLocations;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Laravel\Scout\Searchable;
use Laravolt\Avatar\Facade as Avatar;
use Spatie\Image\Enums\CropPosition;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Spatie\Translatable\HasTranslations;
use Staudenmeir\EloquentHasManyDeep\HasManyDeep;
use Staudenmeir\EloquentHasManyDeep\HasRelationships;

class Group extends Model implements HasMedia
{
    use HasConnections,
        HasLocations,
        HasRelationships,
        HasTranslations,
        InteractsWithMedia,
        Searchable;

    public array $translatable = [
        'bio',
    ];

    public $meiliIndexName = 'cx_groups';

    protected $appends = [
        'hero_img_url',
        'hash',
    ];

    public static function getFilterableAttributes(): array
    {
        return [
            'id',
            'tags.id',
            'tags',
            'hash',
            'proposals.fund.title',
            'proposals.campaign.hash',
            'proposals.communities.hash',
            'proposals.status',
            'proposals_funded',
            'proposals_completed',
            'amount_awarded_ada',
            'amount_awarded_usd',
            'proposals_count',
            'proposals_ideafest',
            'proposals_woman',
            'proposals_impact',
            'ideascale_profiles.hash',
            'proposals.fund.hash'
        ];
    }

    public static function getSearchableAttributes(): array
    {
        return [
            'name',
            'proposals',
            'ideascale_profiles',
            'tags',
            'ideascale_profiles.hash',
            'ideascale_profiles.name',
            'ideascale_profiles.username',
        ];
    }

    public static function getSortableAttributes(): array
    {
        return [
            'name',
            'id',
            'website',
            'proposals_funded',
            'proposals_completed',
            'amount_awarded_ada',
            'amount_awarded_usd',
            'amount_requested',
            'ideascale_profiles.hash',
            'updated_at',
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
     * Scope to filter groups
     */
    public function scopeFilter(Builder $query, array $filters): Builder
    {
        $idsFromHash = ! empty($filters['hashes']) ? (new TransformHashToIds)(collect($filters['hashes']), new static) : [];

        $ids = ! empty($filters['ids']) ? array_merge($filters['ids'], $idsFromHash) : $idsFromHash;

        $query->when($filters['search'] ?? null, function ($query, $search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                    ->orWhere('id', 'ilike', "%{$search}%")
                    ->orWhere('meta_title', 'ilike', "%{$search}%");
            });
        })->when($ids, function ($query) use ($ids) {
            $query->whereIn('id', $ids);
        });

        return $query;
    }

    public function gravatar(): Attribute
    {
        return Attribute::make(
            get: fn () => Avatar::create($this->name ?? 'default')->toGravatar()
        );
    }

    public function heroImgUrl(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->getFirstMediaUrl('hero') ?? $this->gravatar
        );
    }

    public function bannerImgUrl(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->getFirstMediaUrl('banner') ?? null
        );
    }

    public function amountRequestedAda(): Attribute
    {
        return Attribute::make(
            get: function () {
                return $this->proposals()
                    ->whereHas('fund', function ($q) {
                        $q->where('currency', CatalystCurrencySymbols::ADA->name);
                    })->sum('amount_requested');
            },
        );
    }

    public function amountRequestedUsd(): Attribute
    {
        return Attribute::make(
            get: function () {
                return $this->proposals()
                    ->whereHas('fund', function ($q) {
                        $q->where('currency', CatalystCurrencySymbols::USD->name);
                    })->sum('amount_requested');
            },
        );
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
                return $this->funded_proposals()
                    ->whereHas('fund', function ($q) {
                        $q->where('currency', CatalystCurrencySymbols::USD->name);
                    })->sum('amount_requested');
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

    public function tags()
    {
        return $this->belongsToMany(Tag::class, 'model_tag', 'tag_id', 'model_id')
            ->where('model_type', Proposal::class);
    }

    public function locations(): BelongsToMany
    {
        return $this->belongsToMany(
            Location::class,
            'model_has_locations',
            'location_id',
            'model_id'
        )->where('model_type', Proposal::class);
    }

    /**
     * The roles that belong to the user.
     */
    public function proposals(): BelongsToMany
    {
        return $this->belongsToMany(
            Proposal::class,
            'group_has_proposal',
            'group_id',
            'proposal_id',
            'id',
            'id',
            'proposals'
        );
    }

    public function completed_proposals(): BelongsToMany
    {
        return $this->proposals()->where([
            'type' => 'proposal',
            'status' => ProposalStatus::complete()->value,
        ]);
    }

    public function funded_proposals(): BelongsToMany
    {
        return $this->proposals()
            ->where(['type' => 'proposal'])
            ->whereNotNull('funded_at');
    }

    public function unfunded_proposals(): BelongsToMany
    {
        return $this->proposals()
            ->where(['type' => 'proposal'])
            ->whereNull('funded_at');
    }

    public function ideascale_profiles(): BelongsToMany
    {
        return $this->belongsToMany(IdeascaleProfile::class, 'group_has_ideascale_profile', 'group_id', 'ideascale_profile_id');
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(IdeascaleProfile::class, 'user_id');
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('hero')->singleFile();
        $this->addMediaCollection('banner')->singleFile();
    }

    public function reviews(): HasManyDeep
    {
        return $this->hasManyDeepFromRelations($this->proposals(), (new Proposal)->reviews());
    }

    public function registerMediaConversions(?Media $media = null): void
    {
        $this->addMediaConversion('thumbnails')
            ->width(180)
            ->height(180)
            ->withResponsiveImages()
            ->crop(180, 180, CropPosition::Center)
            ->performOnCollections('hero');

        $this->addMediaConversion('banner')
            ->width(1500)
            ->height(550)
            ->crop(2048, 840, CropPosition::Center)
            ->withResponsiveImages()
            ->performOnCollections('banner');
    }

    /**
     * Get the index able data array for the model.
     */
    public function toSearchableArray(): array
    {
        $this->load(['media']);

        $array = $this->toArray();

        $proposals = $this->proposals->load('fund')->map(function ($p) {
            return $p->toArray();
        })->toArray();

        $ideascale_profiles = $this->ideascale_profiles;

        return array_merge($array, [
            'proposals_completed' => collect($proposals)->filter(fn ($p) => $p['status'] === 'complete')?->count() ?? 0,
            'proposals_funded' => collect($proposals)->filter(fn ($p) => (bool) $p['funded_at'])?->count() ?? 0,
            'proposals_unfunded' => collect($proposals)->filter(fn ($p) => empty($p['funded_at']))->count(),
            'amount_received' => intval($this->proposals()->whereNotNull('funded_at')->sum('amount_received')),
            'proposals_woman' => collect($proposals)->filter(fn ($p) => ($p->is_woman_proposal ?? false) === true)->count(),
            'proposals_ideascale' => collect($proposals)->filter(fn ($p) => ($p->is_ideascale_proposal ?? false) === true)->count(),
            'proposals_impact' => collect($proposals)->filter(fn ($p) => ($p->is_impact_proposal ?? false) === true)->count(),
            'reviews_count' => $this->reviews->count(),
            'amount_awarded_ada' => intval($this->amount_awarded_ada),
            'amount_awarded_usd' => intval($this->amount_awarded_usd),
            'amount_distributed_ada' => intval($this->amount_distributed_ada),
            'amount_distributed_usd' => intval($this->amount_distributed_usd),
            'amount_requested_ada' => intval($this->amount_requested_ada),
            'amount_requested_usd' => intval($this->amount_requested_usd),
            'hero_img_url' => $this->hero_img_url,
            'banner_img_url' => $this->banner_img_url,
            'proposals_count' => collect($proposals)->count(),
            'proposals' => $proposals,
            'ideascale_profiles' => $ideascale_profiles,
            'tags' => $this->tags->map(fn ($m) => $m->toArray()),
            'connected_items' => $this->connected_items,
        ]);
    }

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
            'amount_requested' => 'integer',
            'amount_awarded_ada' => 'integer',
            'amount_awarded_usd' => 'integer',
        ];
    }
}
