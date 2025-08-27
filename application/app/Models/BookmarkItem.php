<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\VoteEnum;
use App\Observers\BookmarkItemObserver;
use App\Traits\HasModel;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model as EloquentModel; // Use Laravel's base model
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\SoftDeletes;

#[ObservedBy([BookmarkItemObserver::class])]
class BookmarkItem extends EloquentModel
{
    use HasFactory, HasModel, SoftDeletes;

    protected $primaryKey = 'id';

    protected $keyType = 'int';

    public $incrementing = true;

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
