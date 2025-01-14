<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\CatalystCurrencies;
use App\Enums\CatalystCurrencySymbols;
use App\Enums\ProposalFundingStatus;
use App\Enums\ProposalStatus;
use App\Models\Scopes\OrderByLaunchedDateScope;
use App\Traits\HasMetaData;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Query\Builder;
use Spatie\Image\Enums\CropPosition;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class Fund extends Model implements HasMedia
{
    use HasMetaData,
        InteractsWithMedia,
        SoftDeletes;

    protected $with = [
        'media',
    ];

    protected $appends = [
        'amount_requested',
        'amount_awarded'
    ];

    protected $guarded = [];

    protected $withCount = [
        'proposals',
        'fundedProposals',
        'completedProposals'
    ];

    public function currencySymbol(): Attribute
    {
        return Attribute::make(
            get: fn () => match ($this->currency) {
                CatalystCurrencies::ADA()->value => CatalystCurrencySymbols::ADA,
                default => CatalystCurrencySymbols::USD
            }
        );
    }

    public function label(): Attribute
    {
        return Attribute::make(
            get: function () {
                if (isset($this->attributes['label'])) {
                    return $this->attributes['label'];
                }

                return $this->title;
            }
        );
    }

    public function scopeFilter($query, array $filters)
    {
        $query->when(
            $filters['search'] ?? false,
            fn (Builder $query, $search) => $query->where('title', 'ILIKE', '%'.$search.'%')
        )->when(
            $filters['status'] ?? false,
            fn(Builder $query, $status) => $query->where('status', $status)
        );
    }

    public function proposals(): HasMany
    {
        return $this->hasMany(Proposal::class, 'fund_id', 'id');
    }

    public function fundedProposals(): HasMany
    {
        return $this->hasMany(Proposal::class)->whereIn('funding_status', [
            ProposalFundingStatus::funded()->value,
            ProposalFundingStatus::leftover()->value
        ]);
    }

    public function completedProposals(): HasMany
    {
        return $this->hasMany(Proposal::class)->where('status', ProposalStatus::complete()->value);
    }

    public function amountRequested(): Attribute
    {
        return Attribute::make(
            get: function () {
                return $this->proposals()->sum('amount_requested');
            }
        );
    }

    public function amountAwarded(): Attribute
    {
        return Attribute::make(
            get: function () {
                return $this->proposals()->whereIn('funding_status', [
                    ProposalFundingStatus::funded()->value,
                    ProposalFundingStatus::leftover()->value
                ])->sum('amount_requested');
            }
        );
    }

    public function campaigns(): HasMany
    {
        return $this->hasMany(Campaign::class, 'fund_id', 'id');
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    public function registerMediaConversions(?Media $media = null): void
    {
        $this->addMediaConversion('thumbnail')
            ->width(640)
            ->height(420)
            ->withResponsiveImages()
            ->crop(512, 512, CropPosition::Top)
            ->performOnCollections('hero');
        $this->addMediaConversion('large')
            ->width(2400)
            ->height(1600)
            ->crop(2048, 2048, CropPosition::Top)
            ->withResponsiveImages()
            ->performOnCollections('hero');
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('hero');
    }

    public function getHeroImgUrlAttribute()
    {
        return $this->getFirstMediaUrl('hero') ?: null;
    }

    protected function casts(): array
    {
        return [
            'meta_info' => 'array',
            'updated_at' => 'datetime:Y-m-d',
            'created_at' => 'datetime:Y-m-d',
            'launched_at' => 'datetime:Y-m-d',
            'awarded_at' => 'datetime:Y-m-d',
            'assessment_started_at' => 'datetime:Y-m-d',
            'amount' => 'integer',
        ];
    }

    protected static function booted(): void
    {
        parent::booted();
        static::addGlobalScope(new OrderByLaunchedDateScope);
    }
}
