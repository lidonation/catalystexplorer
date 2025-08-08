<?php

declare(strict_types=1);

namespace App\Models;

use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use App\Enums\CatalystCurrencies;
use App\Enums\ProposalStatus;
use App\Traits\HasMetaData;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Image\Enums\CropPosition;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

#[ApiResource(
    shortName: 'Campaign',
    operations: [
        new GetCollection(
            uriTemplate: '/campaigns'
        ),
        new Get(
            uriTemplate: '/campaigns/{id}'
        ),
    ],
    paginationItemsPerPage: 20,
    paginationMaximumItemsPerPage: 50,
)]
class Campaign extends Model implements HasMedia
{
    use HasMetaData,
        HasUuids,
        InteractsWithMedia,
        SoftDeletes;

    /**
     * Override parent's appends to exclude hash for UUID-based Campaign
     */
    protected $appends = [
        // 'currency',
        // 'hero_img_url', 
        // 'total_distributed',
        // 'total_awarded',
    ];

    /**
     * Indicates if the IDs are auto-incrementing.
     */
    public $incrementing = false;

    /**
     * The "type" of the auto-incrementing ID.
     */
    protected $keyType = 'string';

    protected $hidden = [
        'legacy_id',
        'user_id',
        'fund_id',
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    /**
     * Override toArray to hide id from JSON serialization but keep it accessible for API Platform
     */
    public function toArray()
    {
        $array = parent::toArray();
        // Hide UUID id from JSON output but keep it accessible for IRI generation
        unset($array['id']);
        return $array;
    }

    protected $withCount = [
        // 'proposals', // Temporarily disabled for testing
    ];

    protected $with = [
        // 'media', // Temporarily disabled until we fix polymorphic issues

    ];


    public function label(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->label ?? $this->title
        );
    }

    public function currency(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->currency ?? $this->fund?->currency
        );
    }

    public function totalRequested(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->proposals()->sum('amount_requested')
        );
    }

    public function totalAwarded(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->funded_proposals()->sum('amount_requested')
        );
    }

    public function totalDistributed(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->funded_proposals()->sum('amount_received') ?? null
        );
    }

    public function heroImgUrl(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->getFirstMediaUrl('hero')
        );
    }

    /**
     * Scope to filter campaigns
     */
    public function scopeFilter(Builder $query, array $filters): Builder
    {
        $query->when($filters['search'] ?? null, function ($query, $search) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'ilike', "%{$search}%")
                    ->orWhere('legacy_id', 'like', "%{$search}%")
                    ->orWhere('meta_title', 'ilike', "%{$search}%")
                    ->orWhere('id', 'like', "%{$search}%");
            });
        })->when($filters['ids'] ?? null, function ($query, $ids) {
            $allIds = is_array($ids) ? $ids : explode(',', $ids);
            $query->whereIn('id', $allIds);
        })->when($filters['uuids'] ?? null, function ($query, $uuids) {
            $allUuids = is_array($uuids) ? $uuids : explode(',', $uuids);
            $query->whereIn('id', $allUuids);
        });

        return $query;
    }

    public function getRouteKeyName(): string
    {
        return 'id';
    }


    public function fund(): BelongsTo
    {
        return $this->belongsTo(Fund::class, 'fund_id', 'id');
    }

    public function proposals(): HasMany
    {
        return $this->hasMany(Proposal::class, 'campaign_id', 'id');
    }

    public function completed_proposals(): HasMany
    {
        return $this->proposals()->where([
            'type' => 'proposal',
            'status' => ProposalStatus::complete()->value,
        ]);
    }

    public function funded_proposals(): HasMany
    {
        return $this->proposals()
            ->where(['type' => 'proposal'])
            ->whereNotNull('funded_at');
    }

    public function unfunded_proposals(): HasMany
    {
        return $this->proposals()
            ->where(['type' => 'proposal'])
            ->whereNull('funded_at');
    }

    public function registerMediaConversions(?Media $media = null): void
    {
        $this->addMediaConversion('thumbnail')
            ->width(320)
            ->height(220)
            ->withResponsiveImages()
            ->crop(320, 220, CropPosition::Center)
            ->performOnCollections('hero');
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('hero')
            ->singleFile();
    }

    /**
     * Override the media relationship to handle UUID-specific queries
     */
    public function media(): \Illuminate\Database\Eloquent\Relations\MorphMany
    {
        return $this->morphMany(
            config('media-library.media_model'),
            'model',
            'model_type',
            'model_id'
        )->where('model_type', self::class);
    }

    protected function casts(): array
    {
        return [
            'amount' => 'integer',
            'created_at' => 'datetime',
            'launched_at' => 'datetime',
            'awarded_at' => 'datetime',
            'review_started_at' => 'datetime',
            'currency' => CatalystCurrencies::class.':nullable',
            'updated_at' => 'datetime',
            'meta_data' => 'array',
        ];
    }
}
