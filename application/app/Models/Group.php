<?php

declare(strict_types=1);

namespace App\Models;

use App\Casts\DateFormatCast;
use Spatie\Translatable\HasTranslations;

class Group extends Model
{
    use HasTranslations;

    public array $translatable = [
        'bio',
    ];

    protected function casts(): array
    {
        return [
            'created_at' => DateFormatCast::class,
            'updated_at' => DateFormatCast::class,
        ];
    }
}
