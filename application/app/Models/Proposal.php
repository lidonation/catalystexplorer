<?php

namespace App\Models;

use App\Enums\CatalystCurrencies;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Proposal extends Model
{
    use HasFactory;

    protected $casts = [
        'currency' => CatalystCurrencies::class,
    ];
}
