<?php

declare(strict_types=1);

namespace App\Models;

use App\Models\Model;
use App\Enums\CatalystCurrencies;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Proposal extends Model
{
    use HasFactory;

    protected $casts = [
        'currency' => CatalystCurrencies::class,
    ];
}
