<?php

namespace App\Repositories;

use App\Scopes\LimitScope;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

class Repository implements RepositoryInterface
{
    protected $query;

    // Constructor to bind model to repo
    public function __construct(protected Model $model)
    {
        $this->setModel($model);
    }

    // Get all instances of model
    public function all(): array|Collection
    {
        if ($this->query) {
            return $this->query->get();
        }

        return $this->model->all();
    }

    // Get all instances of model
    public function count()
    {
        if ($this->query) {
            return $this->query->count();
        }

        return $this->model->count();
    }

    // get the record with the given id
    public function find($idOrSlug, ...$params)
    {
        if (is_int($idOrSlug)) {
            return $this->model->findOrFail($idOrSlug);
        }

        return $this->model->where('slug', '=', $idOrSlug)->first();
    }

    // create a new record in the database
    public function create(array $data)
    {
        return $this->model->create($data);
    }

    // update record in the database
    public function update(array $data, $id)
    {
        $record = $this->model->find($id);

        return $record->update($data);
    }

    // remove record from the database
    public function delete($id)
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

    // Get the associated model
    public function getModel(): Model
    {
        return $this->model;
    }

    // Set the associated model
    public function setModel($model): static
    {
        $this->model = $model;
        $this->query = $this->getModel()::query();

        return $this;
    }

    public function setQuery($query): static
    {
        $this->query = $query;

        return $this;
    }

    public function getQuery()
    {
        return $this->query ?? $this->model::query();
    }

    // Eager load database relationships
    public function with($relations)
    {
        return $this->model->with($relations);
    }
}
