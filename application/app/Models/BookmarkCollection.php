<?php

declare(strict_types=1);

namespace App\Models;

use App\Casts\HashId;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class BookmarkCollection extends Model
{
    use SoftDeletes;

    protected $withCount = [
        'items',
    ];

    // protected $fillable = [
    //     'user_id',
    //     'title',
    //     'content',
    //     'visibility',
    // ];

    protected $fillable = [
        'user_id',
        'title',
        'content',
        'visibility',
        'color',
        'allow_comments',
        'status',
        'type',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(BookmarkItem::class);
    }

    public function proposals(): HasMany
    {
        return $this->hasMany(BookmarkItem::class)
            ->where('model_type', Proposal::class);
    }

    public function casts(): array
    {
        return [
            'id' => HashId::class,
        ];
    }
}
