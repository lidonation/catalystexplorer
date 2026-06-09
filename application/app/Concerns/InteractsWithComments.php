<?php

declare(strict_types=1);

namespace App\Concerns;

use App\Models\Comment;
use Illuminate\Database\Eloquent\Relations\MorphMany;

trait InteractsWithComments
{
    public function commentatorComments(): MorphMany
    {
        return $this->morphMany(Comment::class, 'commentator');
    }
}
