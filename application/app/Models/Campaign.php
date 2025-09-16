<?php

declare(strict_types=1);

namespace App\Models;

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

class Campaign extends Model implements HasMedia
{
    use HasMetaData,
        HasUuids,
        InteractsWithMedia,
        SoftDeletes;

    protected $hidden = [
        'user_id',
        'old_id',
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    protected $withCount = [
        'proposals',
    ];

    protected $with = [
        'media',

    ];

    protected $appends = [
        'currency',
        'hero_img_url',
        'total_distributed',
        'total_awarded',
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
     * Scope to filter groups
     */
    public function scopeFilter(Builder $query, array $filters): Builder
    {
        $idsFromHash = isset($filters['hashes']) ? (array) $filters['hashes'] : [];

        $query->when($filters['search'] ?? null, function ($query, $search) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'ilike', "%{$search}%")
                    ->orWhere('id', 'like', "%{$search}%")
                    ->orWhere('meta_title', 'ilike', "%{$search}%");
            });
        })->when($filters['ids'] ?? null, function ($query, $ids) use ($idsFromHash) {
            $query->whereIn('id', is_array($ids) ? array_merge($ids, $idsFromHash) : explode(',', $ids));
        });

        return $query;
    }

    public function fund(): BelongsTo
    {
        return $this->belongsTo(Fund::class, 'fund_id', 'id');
    }

    public function fundUuid(): BelongsTo
    {
        return $this->belongsTo(Fund::class, 'fund_uuid', 'uuid');
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
