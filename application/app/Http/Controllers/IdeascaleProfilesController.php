<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\DataTransferObjects\IdeascaleProfileData;
use App\Enums\IdeascaleProfileSearchParams;
use App\Repositories\IdeascaleProfileRepository;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Fluent;
use Inertia\Inertia;
use Inertia\Response;

class IdeascaleProfilesController extends Controller
{
    protected int $limit = 24;

    protected int $currentPage = 1;

    protected array $queryParams = [];

    public function index(Request $request): Response
    {
        $this->getProps($request);

        $ideascaleProfiles = empty($this->queryParams) ? $this->getIdeascaleProfilesData() : $this->query();

        return Inertia::render('IdeascaleProfile/Index', [
            'ideascaleProfiles' => $ideascaleProfiles,
            'filters' => $this->queryParams,
        ]);
    }

    public function getIdeascaleProfilesData()
    {
        $limit = (int) $this->limit;
        $page = (int) $this->currentPage;

        $ideascaleProfiles = app(IdeascaleProfileRepository::class);

        $queryResults = $ideascaleProfiles->getQuery()
            ->inRandomOrder()
            ->limit($limit)
            ->get();

        return $this->paginate($queryResults, $ideascaleProfiles->getQuery()->count(), $page, $limit);
    }

    protected function getProps(Request $request): void
    {
        $this->queryParams = $request->validate([
            IdeascaleProfileSearchParams::QUERY()->value => 'string|nullable',
            IdeascaleProfileSearchParams::PAGE()->value => 'int|nullable',
            IdeascaleProfileSearchParams::LIMIT()->value => 'int|nullable',
            IdeascaleProfileSearchParams::SORT()->value => 'string|nullable',
        ]);
    }

    protected function query($returnBuilder = false, $attrs = null, $filters = [])
    {
        $page = (int) ($this->queryParams[IdeascaleProfileSearchParams::PAGE()->value] ?? $this->currentPage);
        $limit = (int) ($this->queryParams[IdeascaleProfileSearchParams::LIMIT()->value] ?? $this->limit);
        $sort = ($this->queryParams[IdeascaleProfileSearchParams::SORT()->value] ?? null);

        $args = [
            'filter' => $this->getUserFilters(),
            'offset' => ($page - 1) * $limit,
            'limit' => $limit,
        ];

        if ($sort) {
            $args['sort'] = [$sort];
        }

        $proposals = app(IdeascaleProfileRepository::class);

        $builder = $proposals->search(
            $this->queryParams[IdeascaleProfileSearchParams::QUERY()->value] ?? '',
            $args
        );

        $response = new Fluent($builder->raw());

        return $this->paginate(IdeascaleProfileData::collect($response->hits), $response->estimatedTotalHits, $page, $limit);
    }

    protected function paginate($items, $total, $page, $limit): array
    {
        $pagination = new LengthAwarePaginator(
            $items,
            $total,
            $limit,
            $page,
            [
                'pageName' => 'p',
            ]
        );

        return $pagination->onEachSide(1)->toArray();
    }

    protected function getUserFilters(): array
    {
        return [];
    }
}
