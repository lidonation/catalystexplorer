<?php

declare(strict_types=1);

namespace App\Models;

use App\Traits\HasMetaData;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Signatures extends Model
{
    use HasMetaData;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'stake_key',
        'signature',
        'signature_key',
        'wallet_provider',
        'user_id',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the transactions associated with this signature's stake key.
     */
    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class, 'stake_key', 'stake_key');
    }
}
