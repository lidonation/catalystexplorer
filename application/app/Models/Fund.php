<?php declare(strict_types=1);

namespace App\Models;

use App\Enums\CatalystCurrencySymbols;
use App\Casts\DateFormatCast;
use App\Enums\CatalystCurrencies;
use App\Models\Scopes\OrderByLaunchedDateScope;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Query\Builder;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class Fund extends Model
{
    use InteractsWithMedia,
        SoftDeletes;

    protected $with = [
        'media',
    ];

    protected $appends = ['link', 'hero_url', 'thumbnail_url'];

    protected $guarded = [];

    protected $withCount = [
        'proposals',
    ];

    public function currencySymbol(): Attribute
    {
        return Attribute::make(
            get: fn() => match ($this->currency) {
                CatalystCurrencies::ADA()->value => CatalystCurrencySymbols::ADA,
                default => CatalystCurrencySymbols::USD
            }
        );
    }

    public function label(): Attribute
    {
        return Attribute::make(
            get: function() {
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
            fn (Builder $query, $status) => $query->where('status', $status)
        );
    }

    public function proposals(): HasMany
    {
        return $this->hasMany(Proposal::class, 'fund_id', 'id');
    }

    public function campaigns(): HasMany
    {
        return $this->hasMany(Campaign::class, 'fund_id', 'id');
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    public function registerMediaConversions(Media|null $media = null): void
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

    protected function casts(): array
    {
        return [
            'meta_info' => 'array',
            'updated_at' => DateFormatCast::class,
            'created_at' => DateFormatCast::class,
            'launched_at' => DateFormatCast::class,
            'awarded_at' => DateFormatCast::class,
            'assessment_started_at' => DateFormatCast::class,
            'amount' => 'integer',
        ];
    }

    protected static function booted(): void
    {
        parent::booted();
        static::addGlobalScope(new OrderByLaunchedDateScope);
    }
}
