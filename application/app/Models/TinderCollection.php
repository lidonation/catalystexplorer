<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class TinderCollection extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'fund_id',
        'title',
        'content',
        'prompt',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

}
