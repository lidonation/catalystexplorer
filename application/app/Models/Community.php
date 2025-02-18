<?php

declare(strict_types=1);

namespace App\Models;

use App\Casts\DateFormatCast;
use App\Traits\HasConnections;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Artisan;
use Laravel\Scout\Searchable;

class Community extends Model
{
    use HasConnections, Searchable;

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
}
