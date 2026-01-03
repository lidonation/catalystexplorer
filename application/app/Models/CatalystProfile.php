<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasCatalystProposers;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Spatie\Image\Enums\CropPosition;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class CatalystProfile extends Model implements HasMedia
{
    use HasCatalystProposers, HasUuids, InteractsWithMedia;

    public $guarded = [];

    protected $appends = ['hero_img_url'];

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
