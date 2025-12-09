<?php

declare(strict_types=1);

namespace App\Traits;

use App\Interfaces\IHasMetaData;
use App\Models\Meta;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Fluent;

trait HasMetaData
{
    public function metas(): HasMany
    {
        return $this->hasMany(Meta::class, 'model_id')->where('model_type', static::class);
    }

    public function metaInfo(): Attribute
    {
        return Attribute::make(
            get: function () {
                if (! isset($this->metas)) {
                    return null;
                }

                return new Fluent(
                    $this->metas->map(
                        fn ($m) => [$m->key => $m->content]
                    )->collapse()
                );
            }
        );
    }

    /**
     * Get a meta value by key
     */
    public function getMeta(string $key): ?string
    {
        // Use metaInfo if metas relationship is already loaded
        if ($this->relationLoaded('metas')) {
            return $this->meta_info?->{$key};
        }

        // Otherwise query the database
        $meta = $this->metas()->where('key', $key)->first();

        return $meta?->content;
    }

    /**
     * @param  mixed  $model
     * @param  bool  $updateIfExist
     */
    public function saveMeta(string $key, string|int|float|bool $content, ?IHasMetaData $model = null, $updateIfExist = true): bool
    {
        $model = $model ?? $this;
        $meta = null;
        if ($updateIfExist) {
            $meta = Meta::where([
                'key' => $key,
                'model_id' => $model->id,
                'model_type' => $model::class,
            ])->first();
        }

        if (! $meta instanceof Meta) {
            $meta = new Meta;
            $meta->key = $key;
            $meta->model_type = static::class;
            $meta->model_id = $model->id;
        } else {
            // Handle deletion - but preserve boolean false (which should be stored as '0')
            if ($content === null || $content === '' || $content === []) {
                return $meta->delete();
            }
        }

        // Convert boolean to string for storage
        $meta->content = is_bool($content) ? ($content ? '1' : '0') : $content;

        return $meta->save();
    }
}
