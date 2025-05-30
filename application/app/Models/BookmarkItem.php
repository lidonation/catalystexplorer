<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\VoteEnum;
use App\Traits\HasHashId;
use App\Traits\HasModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class BookmarkItem extends Model
{
    use HasHashId,HasModel, SoftDeletes;

    protected $guarded = [];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function collection(): BelongsTo
    {
        return $this->belongsTo(BookmarkCollection::class, 'bookmark_collection_id');
    }

    public function model(): MorphTo
    {
        return $this->morphTo();
    }

    public function casts(): array
    {
        return [
            'vote' => VoteEnum::class,
        ];

    }
}
