<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Comment extends \Spatie\Comments\Models\Comment
{
    use HasUuids;

    public function commentator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'commentator_id');
    }

    public function nestedComments(): HasMany
    {
        return $this->hasMany(static::class, 'parent_id');
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(static::class, 'parent_id');
    }
}
