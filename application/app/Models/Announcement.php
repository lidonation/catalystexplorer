<?php declare(strict_types=1);

namespace App\Models;

use App\Models\Model;
use App\Casts\DateFormatCast;
use Spatie\MediaLibrary\HasMedia;
use Spatie\Image\Enums\CropPosition;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Prunable;
use Spatie\MediaLibrary\InteractsWithMedia;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class Announcement extends Model implements HasMedia
{
    use Prunable, InteractsWithMedia;

    protected $fillable = [
        'title',
        'content',
        'label',
        'event_starts_at',
        'event_ends_at',
        'user_id',
        'cta'
    ];

    protected function casts(): array
    {
        return [
            'cta' => 'array',
            'event_starts_at' => DateFormatCast::class,
            'event_ends_at' => DateFormatCast::class,
        ];
    }

    /**
     * Define the pruning criteria.
     */
    public function prunable(): Builder
    {
        return static::query()->where('event_ends_at', '<', now());
    }

    public function heroPhotoUrl(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->getMedia('hero_image')->isNotEmpty()
            ? $this->getMedia('hero_image')[0]->getFullUrl()
            : asset('favicon.ico')
        );
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('hero_image');
    }

    public function registerMediaConversions(?Media $media = null): void
    {
        $this->addMediaConversion('thumbnail')
            ->width(150)
            ->height(150)
            ->withResponsiveImages()
            ->crop(150, 150, CropPosition::Top)
            ->performOnCollections('hero_image');

        $this->addMediaConversion('large')
            ->width(1080)
            ->height(1350)
            ->crop(1080, 1350, CropPosition::Top)
            ->withResponsiveImages()
            ->performOnCollections('hero_image');
    }
}

