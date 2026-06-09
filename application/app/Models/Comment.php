<?php

declare(strict_types=1);

namespace App\Models;

use App\Services\CommentTextService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;

/**
 * @property string $id
 * @property string $original_text
 * @property ?string $text
 * @property ?string $parent_id
 * @property string $commentable_id
 * @property string $commentable_type
 * @property ?string $commentator_id
 * @property ?string $commentator_type
 * @property ?\Carbon\Carbon $approved_at
 * @property ?array<mixed, mixed> $extra
 */
class Comment extends Model
{
    use HasUuids;

    protected $guarded = [];

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

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'extra' => 'array',
            'approved_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::saving(function (Comment $comment) {
            $comment->text = app(CommentTextService::class)->process($comment->original_text);
        });
    }

    public function commentable(): MorphTo
    {
        return $this->morphTo();
    }

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

    public function scopeTopLevel(Builder $query): void
    {
        $query->whereNull('parent_id');
    }

    public function scopePending(Builder $query): void
    {
        $query->whereNull('approved_at');
    }

    public function scopeApproved(Builder $query): void
    {
        $query->whereNotNull('approved_at');
    }

    public function isApproved(): bool
    {
        return $this->approved_at !== null;
    }

    public function isPending(): bool
    {
        return ! $this->isApproved();
    }

    public function isTopLevel(): bool
    {
        return $this->parent_id === null;
    }

    public function approve(): self
    {
        if ($this->isPending()) {
            $this->update(['approved_at' => now()]);
        }

        return $this;
    }

    public function reject(): self
    {
        $this->delete();

        return $this;
    }
}
