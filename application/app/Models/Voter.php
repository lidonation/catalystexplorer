<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\HasMany;

class Voter extends Model
{
    protected $with = [];

    protected $appends = [];

    public function registrations(): HasMany
    {
        return $this->hasMany(Registration::class, 'stake_pub', 'stake_pub');
    }

    public function voting_histories(): HasMany
    {
        return $this->hasMany(VoterHistory::class, 'stake_address', 'stake_pub');
    }
}
