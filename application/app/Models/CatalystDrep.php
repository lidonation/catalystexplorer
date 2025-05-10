<?php

declare(strict_types=1);

namespace App\Models;

use App\Models\User;
use App\Models\Signatures;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class CatalystDrep extends Model {

    use SoftDeletes;

    public $guarded = [];

    public function signatures(): HasManyThrough
    {
        return $this->hasManyThrough(Signatures::class,User::class);
    }
}
