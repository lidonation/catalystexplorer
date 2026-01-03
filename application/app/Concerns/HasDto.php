<?php

declare(strict_types=1);

namespace App\Concerns;

use Illuminate\Pagination\AbstractPaginator;
use Illuminate\Support\Collection;

trait HasDto
{
    public function toDto(): mixed
    {
        return static::resolveDtoClass()::from($this);
    }

    public static function toDtoCollection(Collection|array $items): Collection
    {
        return collect($items)->map(function ($item) {
            return is_object($item) && method_exists($item, 'toDto')
                ? $item->toDto()
                : $item;
        });
    }

    public static function toDtoPaginated(AbstractPaginator $paginator): AbstractPaginator
    {
        $paginator->getCollection()->transform(function ($item) {
            return is_object($item) && method_exists($item, 'toDto')
                ? $item->toDto()
                : $item;
        });

        return $paginator;
    }

    protected static function resolveDtoClass(): string
    {
        $modelClass = static::class;
        $modelName = class_basename($modelClass);

        return "App\\DataTransferObjects\\{$modelName}Data";
    }
}
