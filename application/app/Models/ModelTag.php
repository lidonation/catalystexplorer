<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\MorphPivot;

class ModelTag extends MorphPivot
{
    protected $table = 'model_tag';
}
