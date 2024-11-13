<?php

declare(strict_types=1);

namespace App\Models;

use App\Models\Model;
use App\Casts\DateFormatCast;
use App\Enums\CatalystCurrencies;

class Fund extends Model
{
    protected $casts = [
        'launched_at' => DateFormatCast::class,
        'deleted_at' => DateFormatCast::class,
        'awarded_at' => DateFormatCast::class,
        'currency' => CatalystCurrencies::class
    ];
}
