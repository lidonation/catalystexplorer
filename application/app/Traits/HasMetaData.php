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
     * @param  mixed  $model
     * @param  bool  $updateIfExist
     */
    public function saveMeta(string $key, string $content, ?IHasMetaData $model = null, $updateIfExist = true): bool
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
            if (empty($content)) {
                return $meta->delete();
            }
        }

        $meta->content = $content;
        $meta->save();

        return $meta->save();
    }
}
