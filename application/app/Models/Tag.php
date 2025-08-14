<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Tag extends Taxonomy
{
    use HasUuids;
    
    public $append = ['url'];

    public function url(): Attribute
    {
        return Attribute::make(
            get: function () {
                return url("tags/{$this->slug}");
            }
        );
    }

    public function proposals(): BelongsToMany
    {
        return $this->belongsToMany(Proposal::class, ModelTag::class, 'tag_id', 'model_id')
            ->withPivot(['model_type']);
    }

    /**
     * Scope to filter groups
     */
    public function scopeFilter($query, array $filters)
    {
        $query->when($filters['search'] ?? null, function ($query, $search) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('id', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%")
                    ->orWhere('meta_title', 'like', "%{$search}%");
            });
        })
            ->when($filters['ids'] ?? null, function ($query, $ids) {
                $query->whereIn('id', is_array($ids) ? $ids : explode(',', $ids));
            });

        return $query;
    }
}
