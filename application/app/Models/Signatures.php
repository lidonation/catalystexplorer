<?php

declare(strict_types=1);

namespace App\Models;

use App\Traits\HasMetaData;
use Illuminate\Database\Eloquent\SoftDeletes;

class Signatures extends Model
{
    use HasMetaData, SoftDeletes;

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
    ];
}
