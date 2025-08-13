<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\ServiceTypeEnum;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphToMany;
use Spatie\Enum\Laravel\Casts\EnumCast;
use Spatie\Image\Enums\CropPosition;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Staudenmeir\EloquentHasManyDeep\HasRelationships;

class Service extends Model implements HasMedia
{
    use HasRelationships,InteractsWithMedia;

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

    protected $appends = ['header_image_url'];

    protected $hidden = [];

    protected $casts = [
        'type' => EnumCast::class.':'.ServiceTypeEnum::class,
    ];

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

    public function scopeSearch($query, ?string $search)
    {
        return $query->when($search, function ($q, string $search) {
            $search = trim($search);
            $terms = array_filter(explode(' ', $search));

            $q->where(function ($query) use ($terms) {
                foreach ($terms as $term) {
                    $query->where(function ($q) use ($term) {
                        $q->where('title', 'ilike', "%{$term}%")
                            ->orWhere('description', 'ilike', "%{$term}%")
                            ->orWhereHas('user', fn ($q) => $q->where('name', 'ilike', "%{$term}%"));
                    });
                }
            });

            $relevanceCase = [];
            foreach ($terms as $term) {
                $term = strtolower($term);
                $relevanceCase[] = "CASE WHEN LOWER(title) = '{$term}' THEN 1000 ELSE 0 END";

                $relevanceCase[] = "CASE WHEN LOWER(title) LIKE '{$term}%' THEN 500 ELSE 0 END";

                $relevanceCase[] = "CASE WHEN LOWER(title) LIKE '%{$term}%' THEN 100 ELSE 0 END";

                $relevanceCase[] = "CASE WHEN LOWER(description) LIKE '%{$term}%' THEN 10 ELSE 0 END";
            }

            if (! empty($relevanceCase)) {
                $relevanceQuery = '('.implode(' + ', $relevanceCase).')';
                $q->orderByRaw("{$relevanceQuery} DESC");
            }
        });
    }

    public function scopeFilterByCategories($query, $categoryIds = null)
    {
        return $query->when($categoryIds, function ($q, $categoryIds) {
            $ids = is_array($categoryIds) ? $categoryIds : (array) $categoryIds;
            $q->whereHas('categories', function ($query) use ($ids) {
                $query->whereIn(
                    'service_model.model_id',
                    $ids
                );
            });
        });
    }

    public function scopeForUser($query, ?int $userId = null)
    {
        return $query->when($userId, fn ($q) => $q->where('user_id', $userId));
    }

    public function scopeWithStandardRelations($query)
    {
        return $query->with([
            'user:id,name,email',
            'categories:id,name,slug',
            'locations:id,city',
        ]);
    }
}
