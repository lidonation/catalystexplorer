<?php

declare(strict_types=1);

namespace App\Models;

use App\Traits\HasHashId;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;


class Comment extends \Spatie\Comments\Models\Comment
{
    Use HasHashId;
    public function commentator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'commentator_id');
    }

    public function nestedComments(): HasMany
    {
        return $this->hasMany(static::class, 'parent_id');
    }
}
