<?php

declare(strict_types=1);

namespace App\Models;

use App\Casts\DateFormatCast;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Facades\Artisan;
use Laravel\Scout\Searchable;
use Laravolt\Avatar\Facade as Avatar;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\Translatable\HasTranslations;

class Group extends Model implements HasMedia
{
    use HasTranslations, InteractsWithMedia, Searchable;

    public array $translatable = [
        'bio',
    ];

    protected function casts(): array
    {
        return [
            'created_at' => DateFormatCast::class,
            'updated_at' => DateFormatCast::class,
            'amount_requested' => 'integer',
            'amount_awarded_ada' => 'integer',
            'amount_awarded_usd' => 'integer',
        ];
    }

    public static function runCustomIndex(): void
    {
        Artisan::call('cx:create-search-index App\\\\Models\\\\Group cx_groups');
    }

    public static function getFilterableAttributes(): array
    {
        return [
            'id',
            'ideascale_profiles.id',
            'ideascale_profiles',
            'tags.id',
            'tags',
            'proposals',
            'proposals_funded',
            'proposals_completed',
            'amount_awarded_ada',
            'amount_awarded_usd',
        ];
    }

    public static function getSearchableAttributes(): array
    {
        return [
            'name',
            'proposals',
            'ideascale_profiles',
            'tags',
        ];
    }

    public static function getSortableAttributes(): array
    {
        return [
            'name',
            'id',
            'website',
            'proposals_funded',
            'proposals_completed',
            'amount_awarded_ada',
            'amount_awarded_usd',
            'amount_requested',
        ];
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
            get: fn () => Avatar::create($this->name ?? 'default')->toGravatar()
        );
    }

    public function profilePhotoUrl(): Attribute
    {
        return Attribute::make(
            get: fn () => count($this->getMedia('group')) ? $this->getMedia('group')[0]->getFullUrl() : $this->gravatar
        );
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('group')->useDisk('public');
    }

    /**
     * The roles that belong to the user.
     */
    public function proposals(): BelongsToMany
    {
        return $this->belongsToMany(Proposal::class, 'group_has_proposal', 'group_id', 'proposal_id', 'id', 'id', 'proposals')->with('fund');
    }

    public function ideascale_profiles(): BelongsToMany
    {
        return $this->belongsToMany(IdeascaleProfile::class, 'group_has_ideascale_profile', 'group_id', 'ideascale_profile_id');
    }

    /**
     * Get the index able data array for the model.
     */
    public function toSearchableArray(): array
    {
        $this->load(['media']);
        $array = $this->toArray();
        $proposals = $this->proposals->map(fn ($p) => $p->toArray());

        return array_merge($array, [
            'proposals_completed' => $proposals->filter(fn ($p) => $p['status'] === 'complete')?->count() ?? 0,
            'proposals_funded' => $proposals->filter(fn ($p) => (bool) $p['funded_at'])?->count() ?? 0,
            'amount_received' => intval($this->proposals()->whereNotNull('funded_at')->sum('amount_received')),
            'amount_awarded_ada' => intval($this->amount_awarded_ada),
            'amount_awarded_usd' => intval($this->amount_awarded_usd),
            'proposals' => $this->proposals,
            'ideascale_profiles' => $this->ideascale_profiles->map(fn ($m) => $m->toArray()),
            'tags' => $this->tags->map(fn ($m) => $m->toArray()),
        ]);

    }

    public function tags(): Attribute
    {
        return Attribute::make(
            get: function () {
                return Tag::with('proposals')
                    ->whereHas('proposals', function ($q) {
                        $q->whereIn('model_id', $this->proposals->pluck('id'));
                    })
                    ->get();
            },
        );
    }

    public function amountAwardedAda(): Attribute
    {
        return Attribute::make(
            get: function () {
                return $this->proposals()->whereNotNull('funded_at')
                    ->whereHas('fund', function ($q) {
                        $q->where('currency', 'ADA');
                    })->sum('amount_requested');
            },
        );
    }

    public function amountAwardedUsd(): Attribute
    {
        return Attribute::make(
            get: function () {
                return $this->proposals()->whereNotNull('funded_at')
                    ->whereHas('fund', function ($q) {
                        $q->where('currency', 'USD');
                    })->sum('amount_requested');
            },
        );
    }
}
