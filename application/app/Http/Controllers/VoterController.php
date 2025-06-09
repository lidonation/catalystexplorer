<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\DataTransferObjects\VoterData;
use App\Enums\VoterSearchParams;
use App\Repositories\VoterRepository;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Fluent;
use Illuminate\Support\Stringable;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Scout\Builder;

class VoterController extends Controller
{
    protected int $currentPage = 1;

    protected int $limit = 24;

    protected array $queryParams = [];

    protected null|string|Stringable $search = null;

    protected ?string $sortBy = 'created_at';

    protected ?string $sortOrder = 'desc';

    protected Builder $searchBuilder;

    public function index(Request $request): Response
    {
        $this->getProps($request);

        $voters = $this->query();

        $props = [
            'voters' => $voters,
            'search' => $this->search,
            'sort' => "{$this->sortBy}:{$this->sortOrder}",
            'filters' => $this->queryParams,
        ];

        return Inertia::render('Voters/Index', $props);
    }

    protected function getProps(Request $request)
    {
        $this->queryParams = $request->validate([
            VoterSearchParams::PAGE()->value => 'int|nullable',
            VoterSearchParams::LIMIT()->value => 'int|nullable',
            VoterSearchParams::SORTS()->value => 'nullable',
            VoterSearchParams::QUERY()->value => 'string|nullable',
            VoterSearchParams::VOTING_POWER()->value => 'nullable',
            VoterSearchParams::VOTES_COUNT()->value => 'nullable',
            VoterSearchParams::PROPOSALS_VOTED_ON()->value => 'nullable',
            VoterSearchParams::FUND()->value => 'nullable',
            VoterSearchParams::STAKE_KEY()->value => 'nullable',
            VoterSearchParams::VOTING_KEY()->value => 'nullable',
        ]);

        if (! empty($this->queryParams[VoterSearchParams::SORTS()->value])) {
            $sort = collect(explode(':', $this->queryParams[VoterSearchParams::SORTS()->value]))->filter();
            $this->sortBy = $sort->first();
            $this->sortOrder = $sort->last();
        }

        if (isset($this->queryParams[VoterSearchParams::QUERY()->value])) {
            $this->search = $this->queryParams[VoterSearchParams::QUERY()->value];
        }
    }

    public function query()
    {
        $args = [
            'filter' => $this->getUserFilters(),
        ];

        if ((bool) $this->sortBy && (bool) $this->sortOrder) {
            $args['sort'] = ["$this->sortBy:$this->sortOrder"];
        }

        $page = isset($this->queryParams[VoterSearchParams::PAGE()->value])
            ? (int) $this->queryParams[VoterSearchParams::PAGE()->value]
            : 1;

        $limit = isset($this->queryParams[VoterSearchParams::LIMIT()->value])
            ? (int) $this->queryParams[VoterSearchParams::LIMIT()->value]
            : 10;

        $args['offset'] = ($page - 1) * $limit;
        $args['limit'] = $limit;

        $voterRepository = app(VoterRepository::class);

        $query = $this->search ?: '';

        $args['facets'] = ['latest_fund.id', 'latest_fund.title'];

        $builder = $voterRepository->search($query, $args);
        $response = new Fluent($builder->raw());

        $voterData = VoterData::collect($response->hits ?? []);

        $pagination = new LengthAwarePaginator(
            $voterData,
            $response->estimatedTotalHits ?? 0,
            $limit,
            $page,
            [
                'pageName' => VoterSearchParams::PAGE()->value,
                'path' => request()->url(),
                'query' => request()->query(),
            ]
        );

        return $pagination->onEachSide(1)->toArray();
    }

    protected function getUserFilters(): array
    {
        $filters = [];

        if (isset($this->queryParams[VoterSearchParams::VOTING_POWER()->value])) {
            $votingPower = $this->queryParams[VoterSearchParams::VOTING_POWER()->value];
            $filters[] = "voting_power >= {$votingPower}";
        }

        if (isset($this->queryParams[VoterSearchParams::VOTES_COUNT()->value])) {
            $votesCount = $this->queryParams[VoterSearchParams::VOTES_COUNT()->value];
            $filters[] = "votes_count >= {$votesCount}";
        }

        if (isset($this->queryParams[VoterSearchParams::PROPOSALS_VOTED_ON()->value])) {
            $proposalsVotedOn = $this->queryParams[VoterSearchParams::PROPOSALS_VOTED_ON()->value];
            $filters[] = "proposals_voted_on >= {$proposalsVotedOn}";
        }

        if (isset($this->queryParams[VoterSearchParams::FUND()->value])) {
            $fundHashes = $this->queryParams[VoterSearchParams::FUND()->value];
            if (is_array($fundHashes)) {
                $fundHashes = array_map(fn ($hash) => "'{$hash}'", $fundHashes);
                $filters[] = 'latest_fund.hash IN ['.implode(',', $fundHashes).']';
            } else {
                $filters[] = "latest_fund.hash = '{$fundHashes}'";
            }
        }

        if (isset($this->queryParams[VoterSearchParams::STAKE_KEY()->value])) {
            $stakeKey = $this->queryParams[VoterSearchParams::STAKE_KEY()->value];
            $filters[] = "stake_key = '{$stakeKey}'";
        }

        if (isset($this->queryParams[VoterSearchParams::VOTING_KEY()->value])) {
            $votingKey = $this->queryParams[VoterSearchParams::VOTING_KEY()->value];
            $filters[] = "voting_key = '{$votingKey}'";
        }

        return $filters;
    }
}
