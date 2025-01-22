<?php

declare(strict_types=1);

namespace App\Models;

use App\Models\Delegation;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Registration extends Model
{
    protected $with = ['delegators'];

    public function delegators(): HasMany
    {
        return $this->hasMany(Delegation::class, 'registration_id');
    }
}
