<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Scopes\LimitScope;
use App\Contract\RepositoryInterface;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class Repository implements RepositoryInterface
{
    protected $query;

    public function __construct(protected Model $model)
    {
        $this->setModel($model);
    }

    public function all(): array|Collection
    {
        if ($this->query) {
            return $this->query->get();
        }

        return $this->model->all();
    }

    public function count(): int
    {
        if ($this->query) {
            return $this->query->count();
        }

        return $this->model->count();
    }

    public function find(int|string $idOrSlug, ...$params): Model
    {
        if (is_int($idOrSlug)) {
            return $this->model->findOrFail($idOrSlug);
        }

        return $this->model->where('slug', '=', $idOrSlug)->first();
    }

    public function create(array $data): Model
    {
        return $this->model->create($data);
    }

    public function update(array $data, $id): bool
    {
        $record = $this->model->find($id);

        return $record->update($data);
    }

    public function delete($id): int
    {
        return $this->model->destroy($id);
    }

    public function limit($limit = 12): static
    {
        $this->getModel()::withoutGlobalScopes([LimitScope::class]);
        $this->query = $this->getModel()::query();
        $this->query->limit($limit);

        return $this;
    }

    public function paginate($perPage = null): LengthAwarePaginator
    {
        $perPage = $perPage ?? config('app.limit_scope_limit]');
        $this->getModel()::withoutGlobalScopes([LimitScope::class]);
        $this->query = $this->getModel()::query();

        return $this->getQuery()?->fastPaginate($perPage);
    }

    public function getModel(): Model
    {
        return $this->model;
    }

    public function setModel($model): static
    {
        $this->model = $model;
        $this->query = $this->model::query();

        return $this;
    }

    public function setQuery($query): static
    {
        $this->query = $query;

        return $this;
    }

    public function getQuery(): Builder
    {
        return $this->query ?? $this->model::query();
    }

    public function with($relations): Builder
    {
        return $this->model->with($relations);
    }
}
