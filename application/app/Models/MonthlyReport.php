<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Laravel\Scout\Searchable;
use Illuminate\Support\Facades\Artisan;

class MonthlyReport extends Model
{
    
    use Searchable;

    public static function runCustomIndex(): void
    {
        Artisan::call('cx:create-search-index App\\\\Models\\\\MonthlyReport cx_monthly_reports');
    }

    public static function getSearchableAttributes(): array
    {
        return [
            'id',
            'title',
            'content',
        ];
    }

    public function toSearchableArray(): array
    {
        return $this->toArray();
    }

    public function ideascale_profile(): BelongsTo
    {
        return $this->belongsTo(IdeascaleProfile::class);
    }
}
