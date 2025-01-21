<?php

declare(strict_types=1);

namespace App\Models;

use App\Casts\DateFormatCast;
use Laravel\Scout\Searchable;
use Spatie\MediaLibrary\HasMedia;
use Laravolt\Avatar\Facade as Avatar;
use Illuminate\Support\Facades\Artisan;
use Spatie\Translatable\HasTranslations;
use Illuminate\Database\Eloquent\Builder;
use Spatie\MediaLibrary\InteractsWithMedia;
use Illuminate\Database\Eloquent\Casts\Attribute;

class Group extends Model implements HasMedia
{
    use HasTranslations, Searchable, InteractsWithMedia;

    public array $translatable = [
        'bio',
    ];

    protected function casts(): array
    {
        return [
            'created_at' => DateFormatCast::class,
            'updated_at' => DateFormatCast::class,
        ];
    }

    public static function runCustomIndex(): void
    {
        Artisan::call('cx:create-search-index App\\\\Models\\\\Group cx_groups');
    }

    /**
     * Scope to filter groups
     */
    public function scopeFilter(Builder $query, array $filters): Builder
    {
        $query->when($filters['search'] ?? null, function ($query, $search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                    ->orWhere('id', 'like', "%{$search}%")
                    ->orWhere('meta_title', 'ilike', "%{$search}%");
            });
        })->when($filters['ids'] ?? null, function ($query, $ids) {
            $query->whereIn('id', is_array($ids) ? $ids : explode(',', $ids));
        });

        return $query;
    }

    public function gravatar(): Attribute
    {
        return Attribute::make(
            get: fn() => Avatar::create($this->name ?? 'default')->toGravatar()
        );
    }

    public function profilePhotoUrl(): Attribute
    {
        return Attribute::make(
            get: fn() => count($this->getMedia('group')) ? $this->getMedia('group')[0]->getFullUrl() : $this->gravatar
        );
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('group')->useDisk('public');
    }


}
