<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\HasMany;

class Registration extends Model
{
    protected $table = 'registrations';

    protected $with = ['delegators'];

    protected $fillable = [
        'tx',
        'stake_pub',
        'stake_key',
    ];

    public function delegators(): HasMany
    {
        return $this->hasMany(Delegation::class, 'registration_id');
    }
}
