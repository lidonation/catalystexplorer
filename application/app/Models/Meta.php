<?php

declare(strict_types=1);

namespace App\Models;

use App\Traits\HasMetaData;
use Illuminate\Database\Eloquent\Concerns\HasTimestamps;

class Meta extends Model
{
    protected $guarded = [];

    use HasMetaData, HasTimestamps;
}
