<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Ranking extends Model
{
    protected $fillable = [
        'user_id',
        'model_id',
        'model_type',
        'value',
    ];

    public function model(): MorphTo
    {
        return $this->morphTo('model', 'model_type', 'model_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function review(): BelongsTo
    {
        return $this->belongsTo(Review::class, 'model_id');
    }
}
