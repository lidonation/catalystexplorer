<?php declare(strict_types=1);

namespace App\Models;

use App\Models\Model;
use App\Models\Discussion;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Artisan;
use Laravel\Scout\Searchable;

class Review extends Model
{
    use Searchable;

    public static function runCustomIndex(): void
    {
        Artisan::call('cx:index App\\\\Models\\\\Review cx__reviews');
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

    public function children(): Attribute
    {
        $children = $this->metas?->where('key', 'child_id')->pluck('content');

        return Attribute::make(get: fn() => $children->isEmpty() ? null : self::fund($children));
    }

    public function discussion(): BelongsTo
    {
        return $this->belongsTo(Discussion::class, 'model_id')->where('model_type', Discussion::class);
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    public function model(): MorphTo
    {
        return $this->morphTo('model', 'model_type', 'model_id');
    }

    public function review_moderation_reviewer(): HasOne
    {
        return $this->hasOne(ReviewModerationReviewer::class, 'review_id');
    }

}
