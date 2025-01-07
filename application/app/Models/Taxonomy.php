<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasTimestamps;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;
use Spatie\Image\Enums\CropPosition;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class Taxonomy extends Model implements HasMedia
{
    use HasTimestamps,
        InteractsWithMedia,
        SoftDeletes;

    protected $with = ['media'];

    protected $withCount = [

    ];

    protected $fillable = [
        'title',
    ];

    public function hero(): Attribute
    {
        return Attribute::make(
            get: function () {
                if (isset($this->attributes['heroUrl'])) {
                    return $this->attributes['heroUrl'];
                }

                return $this->hero->getfullUrl('large');
            }
        );
    }

    public function thumbnailUrl(): Attribute
    {
        return Attribute::make(
            get: function () {
                if (isset($this->attributes['thumbnailUrl'])) {
                    return $this->attributes['thumbnailUrl'];
                }
                if (! $this->hero?->hasGeneratedConversion('thumbnail')) {
                    return null;
                }

                return $this->hero?->getfullUrl('thumbnail');
            }
        );
    }

    public function scopeFilter($query, array $filters)
    {
        $query->when(
            $filters['search'] ?? false,
            fn (Builder $query, $search) => $query->whereFullText(['title'], "'{$search}':*", ['mode' => 'websearch'])
        );
        $query->when(
            $filters['ids'] ?? false,
            fn (Builder $query, $ids) => $query->whereIn('id', is_array($ids) ? $ids : explode(',', $ids))
        );
    }

    /**
     * Generate unique slug
     *
     * @return array|string ()
     */
    public function createSlug($title): array|string
    {
        if (static::whereSlug($slug = Str::slug($title))->exists()) {
            $max = intval(static::whereTitle($title)->latest('id')->count());

            return "{$slug}-".preg_replace_callback(
                '/(\d+)$/',
                fn ($matches) => $matches[1] + 1,
                (string) $max
            );
        }

        return $slug;
    }

    public function registerMediaConversions(?Media $media = null): void
    {
        $this->addMediaConversion('thumbnail')
            ->width(512)
            ->height(512)
            ->withResponsiveImages()
            ->crop(512, 512, CropPosition::Top)
            ->performOnCollections('hero');
        $this->addMediaConversion('large')
            ->width(2048)
            ->height(2048)
            ->crop(2048, 2048, CropPosition::Top)
            ->withResponsiveImages()
            ->performOnCollections('hero');
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('hero');
    }

    /**
     * Get the route key for the model.
     */
    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'title' => $this->title,
            'link' => $this->link,
        ];
    }

    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        parent::booted();
        //        static::addGlobalScope(new PublishedScope);
        //        static::addGlobalScope(new OrderByOrderScope);
        //        static::addGlobalScope(new OrderByDateScope);
    }
}
