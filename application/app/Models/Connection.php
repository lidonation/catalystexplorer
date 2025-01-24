<?php

declare(strict_types=1);

namespace App\Models;

class Connection extends Model
{
    protected $fillable = [
        'previous_model_type',
        'previous_model_id',
        'next_model_type',
        'next_model_id',
    ];

    /**
     * Get the previous model.
     */
    public function previous()
    {
        return $this->morphTo(null, 'previous_model_type', 'previous_model_id');
    }

    /**
     * Get the next model.
     */
    public function next()
    {
        return $this->morphTo(null, 'next_model_type', 'next_model_id');
    }
}
