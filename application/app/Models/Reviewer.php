<?php

declare(strict_types=1);

namespace App\Models;

use App\Traits\HasMetaData;
use App\Actions\TransformHashToIds;
use Staudenmeir\EloquentHasManyDeep\HasManyDeep;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Staudenmeir\EloquentHasManyDeep\HasRelationships;

class Reviewer extends Model
{
    use HasMetaData, HasRelationships;

    protected $guarded = [];

    protected $appends = ['avg_reputation_score'];

    protected $with = ['claimedBy'];

    public $withCount = ['proposals', 'reviews'];

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function proposals(): HasManyDeep
    {
        return $this->hasManyDeepFromRelations($this->reviews(), (new Review)->proposal());
    }

    public function moderations(): HasMany
    {
        return $this->hasMany(Moderation::class, 'reviewer_id');
    }

    public function avgReputationScore(): Attribute
    {
        $avg = $this->reputation_scores()->avg('score');

        return Attribute::make(
            get: fn() => is_null($avg) ? null : round($avg * 100, 2)
        );
    }

    public function reputation_scores(): HasMany
    {
        return $this->hasMany(ReviewerReputationScore::class, 'reviewer_id');
    }

    public function claimedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'claimed_by_id', 'id');
    }

    public function scopeFilter($query, array $filters)
    {
        $query->where(function ($q) use ($filters) {
            $q->where('catalyst_reviewer_id', 'like', "%{$filters['search']}%");
        })->when($filters['ids'] ?? null, function ($query, $ids) {
            $query->whereIn('id', is_array($ids) ? $ids : explode(',', $ids));
        })->when($filters['hashes'] ?? null, function ($query, $hashes) {
            $ids = (new TransformHashToIds)(collect($hashes), new static);
            $query->whereIn('id', is_array($ids) ? $ids : explode(',', $ids));
        });

        if (! empty($filters['ids'])) {
            $query->whereIn('catalyst_reviewer_id', (array) $filters['ids']);
        }

        return $query;
    }
}
