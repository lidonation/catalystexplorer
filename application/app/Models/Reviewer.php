<?php

declare(strict_types=1);

namespace App\Models;

use App\Traits\HasMetaData;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Reviewer extends Model
{
    use HasMetaData;

    protected $guarded = [];

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function moderations(): HasMany
    {
        return $this->hasMany(Moderation::class, 'reviewer_id');
    }

    public function reputation_scores(): HasMany
    {
        return $this->hasMany(ReviewerReputationScore::class, 'reviewer_id');
    }
}
