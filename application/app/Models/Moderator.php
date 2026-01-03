<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasMetaData;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Moderator extends Model
{
    use HasMetaData, HasUuids, SoftDeletes;

    protected $guarded = [];

    public function moderations(): HasMany
    {
        return $this->hasMany(Moderation::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }
}
