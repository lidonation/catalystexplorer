<?php

declare(strict_types=1);

namespace App\Models;

use App\Casts\DateFormatCast;
use App\Enums\CatalystCurrencySymbols;
use App\Traits\HasConnections;
use App\Traits\HasTaxonomies;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Facades\Artisan;
use Laravel\Scout\Searchable;

class Community extends Model
{
    use HasConnections, HasTaxonomies, Searchable;

    protected $appends = ['hash'];

    protected function casts(): array
    {
        return [
            'created_at' => DateFormatCast::class,
            'updated_at' => DateFormatCast::class,
        ];
    }

    public static function runCustomIndex(): void
    {
        Artisan::call('cx:create-search-index App\\\\Models\\\\Community cx_communities');
    }

    /**
     * Scope to filter groups
     */
    public function scopeFilter(Builder $query, array $filters): Builder
    {
        $query->when($filters['search'] ?? null, function ($query, $search) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'ilike', "%{$search}%")
                    ->orWhere('id', 'like', "%{$search}%");
            });
        })->when($filters['ids'] ?? null, function ($query, $ids) {
            $query->whereIn('id', is_array($ids) ? $ids : explode(',', $ids));
        });

        return $query;
    }

    public function proposals(): BelongsToMany
    {
        return $this->belongsToMany(Proposal::class, 'community_has_proposal', 'community_id', 'proposal_id', 'id', 'id', 'proposals');
    }

    public function funded_proposals(): BelongsToMany
    {
        return $this->proposals()
            ->where(['type' => 'proposal'])
            ->whereNotNull('funded_at');
    }

    public function amountAwardedAda(): Attribute
    {
        return Attribute::make(
            get: function () {
                return $this->funded_proposals()
                    ->whereHas('fund', function ($q) {
                        $q->where('currency', CatalystCurrencySymbols::ADA->name);
                    })->sum('amount_requested');
            },
        );
    }

    public function amountAwardedUsd(): Attribute
    {
        return Attribute::make(
            get: function () {
                return $this->funded_proposals()
                    ->whereHas('fund', function ($q) {
                        $q->where('currency', CatalystCurrencySymbols::USD->name);
                    })->sum('amount_requested');
            },
        );
    }

    public function ideascale_profiles(): BelongsToMany
    {
        return $this->belongsToMany(IdeascaleProfile::class, 'community_has_ideascale_profile', 'community_id', 'ideascale_profile_id');
    }
}
