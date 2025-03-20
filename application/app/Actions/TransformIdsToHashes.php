<?php

declare(strict_types=1);

namespace App\Actions;

use App\Models\Model;
use App\Services\HashIdService;
use Illuminate\Support\Collection;

class TransformIdsToHashes
{
    public function __invoke(Collection $collection, Model $model): Collection
    {
        return $this->handle($collection, $model);
    }

    public function handle(Collection $collection, Model $model): Collection
    {
        return $collection->map(function ($item) use ($model) {
            if ($item instanceof Model) {
                $item = $item->toArray();
            } elseif (is_object($item)) {
                $item = (array) $item;
            }

            if (isset($item['id'])) {
                $item['hash'] = app(HashIdService::class, compact('model'))
                    ->encode($item['id']);
            }

            return $item;
        });
    }
}
