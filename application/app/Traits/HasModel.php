<?php

declare(strict_types=1);

namespace App\Traits;

use Illuminate\Database\Eloquent\Relations\MorphTo;

trait HasModel
{
    public function model(): MorphTo
    {
        return $this->morphTo('model', 'model_type', 'model_id');
    }
}
