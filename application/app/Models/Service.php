<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\ServiceTypeEnum;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphToMany;
use Laravel\Scout\Searchable;
use Spatie\Enum\Laravel\Casts\EnumCast;
use Spatie\Image\Enums\CropPosition;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Staudenmeir\EloquentHasManyDeep\HasRelationships;

class Service extends Model implements HasMedia
{
    use HasRelationships, InteractsWithMedia, Searchable;

    protected $fillable = [
        'title',
        'description',
        'type',
        'user_id',

        'name',
        'email',
        'website',
        'github',
        'linkedin',
    ];

    protected $casts = [
        'type' => EnumCast::class.':'.ServiceTypeEnum::class,
    ];

    protected $appends = ['header_image_url'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function models(string $modelClass): MorphToMany
    {
        return $this->morphedByMany($modelClass, 'model', 'service_model');
    }

    public function categories(): MorphToMany
    {
        return $this->morphedByMany(Category::class, 'model', 'service_model');
    }

    public function locations(): MorphToMany
    {
        return $this->morphToMany(Location::class, 'model', 'model_has_locations');
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('header')
            ->singleFile()
            ->useFallbackUrl(asset('images/default-service-header.jpg'));
    }

    public function registerMediaConversions(?Media $media = null): void
    {
        $this->addMediaConversion('thumbnail')
            ->width(300)
            ->height(200)
            ->withResponsiveImages()
            ->crop(300, 200, CropPosition::Center)
            ->performOnCollections('header');

        $this->addMediaConversion('large')
            ->width(1200)
            ->height(800)
            ->crop(1200, 800, CropPosition::Center)
            ->withResponsiveImages()
            ->performOnCollections('header');
    }

    public function headerImageUrl(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->getFirstMediaUrl('header')
                  ?: asset('images/default-service-header.jpg')
        );
    }

    public function getEffectiveContactDetailsAttribute(): array
    {
        return [
            'name' => $this->effective_name,
            'email' => $this->effective_email,
            'website' => $this->effective_website,
            'github' => $this->effective_github,
            'linkedin' => $this->effective_linkedin,
            'location' => $this->effective_location,
        ];
    }

    public function toSearchableArray(): array
    {
        $array = [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'type' => $this->type->value,
        ];
        if ($this->relationLoaded('categories')) {
            $array['categories'] = $this->categories->map->only(['id', 'name', 'slug']);
            $array['category_ids'] = $this->categories->modelKeys();
        }

        if ($this->relationLoaded('locations')) {
            $array['location'] = $this->locations->first()?->only(['city', 'region', 'country']);
        }

        $array['contact'] = $this->effective_details;

        return $array;
    }

    public function searchableAs(): string
    {
        return 'cx_services';
    }

    public function shouldBeSearchable(): bool
    {
        return ! is_null($this->user_id) && ! is_null($this->title);
    }
}
