<?php

declare(strict_types=1);

namespace App\Models;

use App\Traits\HasMetaData;

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

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
