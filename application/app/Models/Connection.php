<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Connection extends Model
{
    use HasUuids;

    protected $fillable = [
        'previous_model_type',
        'previous_model_id',
        'next_model_type',
        'next_model_id',
    ];

    /**
     * Get the previous model.
     */
    public function previous(): MorphTo
    {
        return $this->morphTo(null, 'previous_model_type', 'previous_model_id');
    }

    /**
     * Get the next model.
     */
    public function next(): MorphTo
    {
        return $this->morphTo(null, 'next_model_type', 'next_model_id');
    }
}
