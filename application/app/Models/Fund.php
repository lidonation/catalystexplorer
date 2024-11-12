<?php

declare(strict_types=1);

namespace App\Models;

use App\Casts\DateFormatCast;
use App\Enums\CatalystCurrencies;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Fund extends Model
{
    use HasFactory;

    protected $casts = [
        'launched_at' => DateFormatCast::class,
        'deleted_at' => DateFormatCast::class,
        'awarded_at' => DateFormatCast::class,
        'currency' => CatalystCurrencies::class
    ];

}
