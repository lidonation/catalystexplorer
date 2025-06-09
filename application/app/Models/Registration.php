<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Registration extends Model
{
    protected $with = ['delegators'];

    public function delegators(): HasMany
    {
        return $this->hasMany(Delegation::class, 'registration_id');
    }

    public function transaction(): BelongsTo
    {
        return $this->belongsTo(Transaction::class, 'tx_hash', 'tx');
    }
}
