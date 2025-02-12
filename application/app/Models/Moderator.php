<?php

namespace App\Models;

use App\Traits\HasMetaData;
use Illuminate\Database\Eloquent\Model;
use App\Models\CatalystExplorer\Moderation;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Moderator extends Model
{
    use SoftDeletes, HasMetaData;

    public function moderations(): HasMany
    {
        return $this->hasMany(Moderation::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }
}
