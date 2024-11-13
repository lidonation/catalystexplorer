<?php

declare(strict_types=1);

namespace App\Models;

use App\Casts\DateFormatCast;

class Community extends Model
{
    protected function casts(): array
    {
        return [
            'created_at' => DateFormatCast::class,
            'updated_at' => DateFormatCast::class,
        ];
    }
}
