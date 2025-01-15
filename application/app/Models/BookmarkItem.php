<?php

declare(strict_types=1);

namespace App\Models;

use App\Models\Traits\HasModel;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class BookmarkItem extends Model
{
    use HasFactory, HasModel, SoftDeletes;

    protected $fillable = [
        'user_id',
        'model_type',
        'model_id',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function collection(): BelongsTo
    {
        return $this->belongsTo(BookmarkCollection::class, 'bookmark_collection_id');
    }
}
