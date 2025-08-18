<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\HasMany;

class Registration extends Model
{
    protected $with = ['delegators'];

    protected $keyType = 'int';
    
    public $incrementing = true;
    
    public function uniqueIds(): array
    {
        return [];
    }

    public function delegators(): HasMany
    {
        return $this->hasMany(Delegation::class, 'registration_id');
    }
}