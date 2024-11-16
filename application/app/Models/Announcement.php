<?php declare(strict_types=1);

namespace App\Models;

use App\Models\Model;

use App\Casts\DateFormatCast;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Prunable;
use Illuminate\Database\Eloquent\SoftDeletes;

class Announcement extends Model
{
    use Prunable;

    protected $fillable = [
        'title',
        'content',
        'label',
        'event_starts_at',
        'event_ends_at',
        'user_id',
        'cta'
    ];

    protected function casts(): array
    {
        return [
            'cta' => 'array',
            'event_starts_at' => DateFormatCast::class,
            'event_ends_at' => DateFormatCast::class,
        ];
    }

    /**
     * Define the pruning criteria.
     */
    public function prunable(): Builder
    {
        return static::query()->where('event_ends_at', '<', now());
    }
}

