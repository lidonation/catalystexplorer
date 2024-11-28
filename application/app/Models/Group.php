<?php

declare(strict_types=1);

namespace App\Models;

use App\Casts\DateFormatCast;
use Illuminate\Support\Facades\Artisan;
use Laravel\Scout\Searchable;
use Spatie\Translatable\HasTranslations;

class Group extends Model
{
    use HasTranslations, Searchable;

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

    public static function runCustomIndex(): void
    {
        Artisan::call('cx:index App\\\\Models\\\\Group cx__groups');
    }

    public static function getSearchableAttributes(): array
    {
        return [
            'id',
            'name',
            'bio',
            'slug',
        ];
    }

    public function toSearchableArray(): array
    {
        return $this->toArray();
    }
}
