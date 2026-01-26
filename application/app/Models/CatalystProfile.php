<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasCatalystProposers;
use App\Concerns\HasConnections;
use App\Models\Pivot\ClaimedProfile;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Laravel\Scout\Searchable;
use Spatie\Image\Enums\CropPosition;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class CatalystProfile extends Model implements HasMedia
{
    use HasCatalystProposers, HasConnections, HasUuids, InteractsWithMedia, Searchable;

    public $guarded = [];

    protected $appends = ['hero_img_url', 'claimed_by'];

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

    public function claimed_profiles(): MorphMany
    {
        return $this->morphMany(ClaimedProfile::class, 'claimable');
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
            'catalyst_id',
            'stake_address',
        ];
    }

    public static function getFilterableAttributes(): array
    {
        return [
            'id',
            'proposals_count',
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

    public function getClaimedByAttribute()
    {
        return $this->claimed_by_users->first()?->id;
    }
}
