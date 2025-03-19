<?php

declare(strict_types=1);

namespace App\Actions;

use App\Models\Model;
use App\Services\HashIdService;
use Illuminate\Support\Collection;

class TransformHashToIds
{
    public function __invoke(Collection $collection, Model $model): array
    {
        return $this->handle($collection, $model);
    }

    public function handle(Collection $collection, Model $model): array
    {
        return $collection->flatMap(function ($hash) use ($model) {
            return [app(HashIdService::class, compact('model'))
                ->decode($hash)];
        })->toArray();
    }
}
