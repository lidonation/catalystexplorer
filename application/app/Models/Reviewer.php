<?php

declare(strict_types=1);

namespace App\Models;

use App\Traits\HasMetaData;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Staudenmeir\EloquentHasManyDeep\HasManyDeep;
use Staudenmeir\EloquentHasManyDeep\HasRelationships;

class Reviewer extends Model
{
    use HasMetaData,HasRelationships;

    protected $guarded = [];

    protected $appends = ['avg_reputation_score'];

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
            get: fn () => is_null($avg) ? null : round($avg * 100, 2)
        );
    }

    public function reputation_scores(): HasMany
    {
        return $this->hasMany(ReviewerReputationScore::class, 'reviewer_id');
    }
}
