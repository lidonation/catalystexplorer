<?php

declare(strict_types=1);

namespace App\Models;

use App\Casts\DateFormatCast;
use App\Enums\CatalystCurrencies;

class Proposal extends Model
{
    protected function casts(): array
    {
        return [
            'created_at' => DateFormatCast::class,
            'updated_at' => DateFormatCast::class,
            'currency' => CatalystCurrencies::class
        ];
    }
}
