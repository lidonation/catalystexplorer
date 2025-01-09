<?php

namespace App\Models\Traits;

use Illuminate\Database\Eloquent\Relations\MorphTo;

trait HasModel
{
    public function model(): MorphTo
    {
        return $this->morphTo('model', 'model_type', 'model_id');
    }
}
