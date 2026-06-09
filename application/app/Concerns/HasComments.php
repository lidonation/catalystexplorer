<?php

declare(strict_types=1);

namespace App\Concerns;

use App\Models\Comment;
use Illuminate\Database\Eloquent\Relations\MorphMany;

trait HasComments
{
    public function comments(): MorphMany
    {
        return $this->morphMany(Comment::class, 'commentable');
    }

    /**
     * The human-readable name of the model a comment was made on.
     */
    abstract public function commentableName(): string;

    /**
     * The URL where the comments on this model can be read.
     */
    abstract public function commentUrl(): string;
}
