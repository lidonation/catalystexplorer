<?php

declare(strict_types=1);

namespace App\Models;

use App\Traits\HasModel;
use Illuminate\Database\Eloquent\SoftDeletes;

class Rule extends Model
{
    use HasModel, SoftDeletes;
}
