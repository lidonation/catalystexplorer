<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\DataTransferObjects\VoterHistoryData;
use Illuminate\Http\Request;
use App\Enums\VoteSearchParams;
use App\Repositories\VoterHistoryRepository;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Fluent;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Scout\Builder;

class VoterHistoryController extends Controller
{
    protected int $currentPage = 1;

    protected int $limit = 24;

    protected array $queryParams = [];
    
    protected null|string|Stringable $search = null;

    protected ?string $sortBy = 'time';

    protected ?string $sortOrder = 'asc';

    protected Builder $searchBuilder;

    public function index(Request $request): Response
    {
        $this->getProps($request);

        $voterHistories = $this->query();

        $props = [
            'voterHistories' => Inertia::optional(
                fn () => $voterHistories
            ),
            'search' => $this->search,
            'sort' => "{$this->sortBy}:{$this->sortOrder}",
            'filters' => $this->queryParams,
        ];

        // dd($props);

        return Inertia::render('Votes/Index', $props);
    }

    protected function getProps($request)
    {
        $this->queryParams = $request->validate([
            VoteSearchParams::QUERY()->value => 'string|nullable',
            VoteSearchParams::PAGE()->value => 'int|nullable',
            VoteSearchParams::LIMIT()->value => 'int|nullable',
            VoteSearchParams::SORTS()->value => 'nullable',
            VoteSearchParams::CHOICE()->value => 'int|nullable',
        ]);

        // format sort params for meili
        if (! empty($this->queryParams[VoteSearchParams::SORTS()->value])) {
            $sort = collect(
                explode(
                    ':',
                    $this->queryParams[VoteSearchParams::SORTS()->value]
                )
            )->filter();

            $this->sortBy = $sort->first();

            $this->sortOrder = $sort->last();
        }
    }

    public function query($returnBuilder = false, $attrs = null, $filters = [])
    {
        $args = [
            'filter' => $this->getUserFilters(),
        ];

        if ((bool) $this->sortBy && (bool) $this->sortOrder) {
            $args['sort'] = ["$this->sortBy:$this->sortOrder"];
        }

        $page = isset($this->queryParams[VoteSearchParams::PAGE()->value])
            ? (int) $this->queryParams[VoteSearchParams::PAGE()->value]
            : 1;

        $limit = isset($this->queryParams[VoteSearchParams::LIMIT()->value])
            ? (int) $this->queryParams[VoteSearchParams::LIMIT()->value]
            : 36;

        $args['offset'] = ($page - 1) * $limit;
        $args['limit'] = $limit;

        $voterHistories = app(VoterHistoryrepository::class);

        $builder = $voterHistories->search(
            $this->queryParams[VoteSearchParams::QUERY()->value] ?? '',
            $args
        );

        $response = new Fluent($builder->raw());

        $this->setCounts($response->facetDistribution, $response->facetStats);

        $pagination = new LengthAwarePaginator(
            VoterHistoryData::collect($response->hits),
            $response->estimatedTotalHits,
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
        $filters = [];
        
        if (! empty($this->queryParams[VoteSearchParams::CHOICE()->value])) {
            $choices = ($this->queryParams[VoteSearchParams::CHOICE()->value]);
            $filters[] = '('.implode(' OR ', array_map(fn ($c) => "choice = {$c}", $choices)).')';
        }

        return $filters;
    }

    public function setCounts($facets, $facetStats)
    {
        if (isset($facets['choice'])) {
            $this->choice = $facets['choice'];
        }
    }
}
