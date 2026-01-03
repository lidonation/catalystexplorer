<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasModel;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\SoftDeletes;

class Rule extends Model
{
    use HasModel, HasUuids, SoftDeletes;
}
