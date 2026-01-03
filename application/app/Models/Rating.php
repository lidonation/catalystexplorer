<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasMetaData;
use DateTime;
use Illuminate\Database\Eloquent\Concerns\HasTimestamps;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Rating extends Model
{
    use HasMetaData,
        HasTimestamps,
        HasUuids,
        SoftDeletes;

    protected $with = ['model'];

    public int|DateTime|null $cacheFor = 3600;

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'updated_at' => 'datetime:Y-m-d',
        'created_at' => 'datetime:Y-m-d',
    ];

    public function model(): MorphTo
    {
        return $this->morphTo('model', 'model_type', 'model_id');
    }

    public function review(): BelongsTo
    {
        return $this->belongsTo(Review::class, 'review_id', 'id', 'review');
    }
}
