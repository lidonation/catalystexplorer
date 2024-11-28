<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Contract\RepositoryInterface;
use App\Models\Scopes\LimitScope;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Schema;
use Laravel\Scout\Builder as ScoutBuilder;
use Meilisearch\Endpoints\Indexes;
use Saloon\PaginationPlugin\Paginator;
use Laravel\Scout\Searchable;

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

    /**
     * The args is an associative array that can contain meilisearch options or a
     * searchable key which is an array of fields to search on normal eloquent
     */
    public function search(string $term, array $args = []): ScoutBuilder | Builder
    {
        if (in_array(Searchable::class, class_uses_recursive($this->model))) {
            return $this->model::search($term, function (Indexes $index, string $query, $defaultOptions) use ($args) {
                $mergedOptions = array_merge($defaultOptions, $args);
                return $index->search($query, $mergedOptions);
            });
        }

        return $this->model::query()->where(function ($query) use ($term, $args) {
            foreach ($args['searchable'] ?? $this->getDefaultSearchFields() as $attribute) {
                $query->orWhere($attribute, 'LIKE', "%{$term}%");
            }
        });
    }

    public function countSearchResults(string $term, array $args = []): int
    {
        if (in_array(Searchable::class, class_uses_recursive($this->model))) {
            return $this->model::search($term, function (Indexes $index, string $query, $defaultOptions) use ($args) {
                $mergedOptions = array_merge($defaultOptions, $args, [
                    'limit' => 0,
                    'attributesToRetrieve' => [],
                ]);

                return $index->search($query, $mergedOptions)->getEstimatedTotalHits();
            })->raw();
        }

        return $this->model::query()->where(function ($query) use ($term, $args) {
            foreach ($args['searchable'] ?? $this->getDefaultSearchFields() as $attribute) {
                $query->orWhere($attribute, 'LIKE', "%{$term}%");
            }
        })->count();
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

    public function paginate($perPage = null): LengthAwarePaginator|Paginator
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

    protected function getDefaultSearchFields(): array
    {
        $possibleFields = ['title', 'name', 'content'];
        return collect($possibleFields)
            ->filter(fn($field) => Schema::hasColumn($this->model->getTable(), $field))
            ->values()
            ->toArray();
    }
}
