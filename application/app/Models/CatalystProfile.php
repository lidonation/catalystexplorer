<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasCatalystProposers;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Laravel\Scout\Searchable;
use Spatie\Image\Enums\CropPosition;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class CatalystProfile extends Model implements HasMedia
{
    use HasCatalystProposers, HasUuids, InteractsWithMedia, Searchable;

    public $guarded = [];

    protected $appends = ['hero_img_url'];

    public string $meiliIndexName = 'cx_catalyst_profiles';

    public function groups(): BelongsToMany
    {
        return $this->belongsToMany(
            Group::class,
            'group_has_ideascale_profile',
            'ideascale_profile_id',
            'group_id'
        );
    }

    public function groupsUuid(): BelongsToMany
    {
        return $this->belongsToMany(
            Group::class,
            'group_has_ideascale_profile',
            'ideascale_profile_id',
            'group_id',
            'id',
            'id'
        );
    }

    public static function getSortableAttributes(): array
    {
        return [
            'id',
            'name',
            'username',
            'updated_at',
            'proposals_count',
        ];
    }

    public static function getSearchableAttributes(): array
    {
        return [
            'id',
            'name',
            'username',
        ];
    }

    public static function getFilterableAttributes(): array
    {
        return [
            'id',
            'proposals_count',
            'claimed_by',
            'proposals.campaign',
            'proposals.tags',
            'proposals',
        ];
    }

    public function toSearchableArray(): array
    {
        $this->loadCount(['proposals']);

        $array = $this->toArray();

        return array_merge($array, [
            'hero_img_url' => $this->hero_img_url,
            'proposals_count' => $this->proposals_count ?? 0,
        ]);
    }

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

    protected function casts(): array
    {
        return [
            'catalyst_keys' => 'array',
        ];
    }
}
