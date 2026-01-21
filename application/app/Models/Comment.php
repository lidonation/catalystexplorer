<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Comment extends \Spatie\Comments\Models\Comment
{
    use HasUuids;

    // Note: Not overriding boot() to allow HasUuids trait to work properly
    // UUID generation is handled manually in CommentController
    //        // Ensure UUID is set before any other processing
    //        static::creating(function (Comment $comment) {
    //            if (empty($comment->id)) {
    //                $comment->id = (string) Str::uuid();
    //            }
    //        });
    //    }

    /**
     * The data type of the auto-incrementing ID.
     *
     * @var string
     */
    protected $keyType = 'string';

    /**
     * Indicates if the IDs are auto-incrementing.
     *
     * @var bool
     */
    public $incrementing = false;

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
