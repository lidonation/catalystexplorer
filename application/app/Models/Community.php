<?php

declare(strict_types=1);

namespace App\Models;

use App\Casts\DateFormatCast;
use Illuminate\Support\Facades\Artisan;
use Laravel\Scout\Searchable;

class Community extends Model
{
    use Searchable;
    protected function casts(): array
    {
        return [
            'created_at' => DateFormatCast::class,
            'updated_at' => DateFormatCast::class,
        ];
    }
    public static function runCustomIndex(): void
    {
        Artisan::call('cx:index App\\\\Models\\\\Community cx__communities');
    }

    public static function getSearchableAttributes(): array
    {
        return [
            'id',
            'title',
            'content',
            'slug',
        ];
    }

    public function toSearchableArray(): array
    {
        return $this->toArray();
    }
}
