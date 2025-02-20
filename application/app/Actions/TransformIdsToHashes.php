<?php

declare(strict_types=1);

namespace App\Actions;

use App\Models\Model;
use App\Services\HashIdService;
use Illuminate\Support\Collection;

class TransformIdsToHashes
{
    public function __invoke(Collection &$collection, Model $model): Collection
    {
        return $this->handle($collection, $model);
    }

    public function handle(Collection &$collection, Model $model): Collection
    {
        return $collection
            ->map(function ($array) use ($model) {
                $array['hash'] = app(HashIdService::class, compact('model'))
                    ->encode($array['id']);

                return $array;
            });
    }
}
