<?php

declare(strict_types=1);

namespace App\Models;

use App\Models\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;


class Discussion extends Model
{
    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'updated_at' => 'datetime:Y-m-d',
        'published_at' => 'datetime:Y-m-d',
    ];

    public function model(): BelongsTo
    {
        return $this->morphTo('model', 'model_type', 'model_id');
    }

    public function review(): BelongsTo
    {
        return $this->belongsTo(Review::class, 'model_id');
    }

    public function proposal(): BelongsTo
    {
        return $this->belongsTo(Proposal::class, 'model_id');
    }
}
