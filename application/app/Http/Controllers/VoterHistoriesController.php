<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\DataTransferObjects\VoterHistoryData;
use Illuminate\Http\Request;
use App\Enums\VoteSearchParams;
use App\Models\VoterHistory;
use App\Models\Voter;
use App\Models\VotingPower;
use App\Repositories\VoterHistoryRepository;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Fluent;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Scout\Builder;
use Illuminate\Support\Stringable;
use Illuminate\Support\Facades\Log;

class VoterHistoriesController extends Controller
{
    protected int $currentPage = 1;

    protected int $limit = 24;

    protected array $queryParams = [];

    protected null|string|Stringable $search = null;

    protected null|string|Stringable $secondarySearch = null;

    protected ?string $sortBy = 'time';

    protected ?string $sortOrder = 'asc';

    protected Builder $searchBuilder;

    protected array $choice = [];

    protected array $funds = [];

    /**
     * Display the voter history index page
     */
    public function index(Request $request): Response
    {
        $this->getProps($request);
        
        $voterHistories = $this->query();

        $props = [
            'voterHistories' => $voterHistories,
            'search' => $this->search,
            'secondarySearch' => $this->secondarySearch,
            'sort' => "{$this->sortBy}:{$this->sortOrder}",
            'filters' => $this->queryParams,
        ];

        return Inertia::render('Votes/Index', $props);
    }

    /**
     * Process request parameters and set controller properties
     */
    protected function getProps(Request $request)
    {
        $this->queryParams = $request->validate([
            VoteSearchParams::CHOICE()->value => 'nullable',
            VoteSearchParams::FUND()->value => 'nullable',
            VoteSearchParams::PAGE()->value => 'int|nullable',
            VoteSearchParams::LIMIT()->value => 'int|nullable',
            VoteSearchParams::SORTS()->value => 'nullable',
            VoteSearchParams::QUERY()->value => 'string|nullable',
            VoteSearchParams::SECONDARY_QUERY()->value => 'string|nullable',
        ]);
        
        if (!empty($this->queryParams[VoteSearchParams::SORTS()->value])) {
            $sort = collect(explode(':', $this->queryParams[VoteSearchParams::SORTS()->value]))->filter();
            $this->sortBy = $sort->first();
            $this->sortOrder = $sort->last();
        }
        
        if (isset($this->queryParams[VoteSearchParams::QUERY()->value])) {
            $this->search = $this->queryParams[VoteSearchParams::QUERY()->value];
        }
        
        if (isset($this->queryParams[VoteSearchParams::SECONDARY_QUERY()->value])) {
            $this->secondarySearch = $this->queryParams[VoteSearchParams::SECONDARY_QUERY()->value];
        }
    }

    /**
     * Execute the query with filters and return paginated results
     */
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

        $limit = isset($this->queryParams['l'])
            ? (int) $this->queryParams['l']
            : 9;

        $args['offset'] = ($page - 1) * $limit;
        $args['limit'] = $limit;

        $voterHistories = app(VoterHistoryRepository::class);
        
        $query = '';
        
        if (!empty($this->secondarySearch)) {
            $query = $this->secondarySearch;
            $args['isSecondarySearch'] = true;
            
            if (!empty($this->search)) {
                $args['filter'][] = "stake_address = '{$this->search}'";
            }
        } 
        else if (!empty($this->search)) {
            $query = $this->search;
            $args['isStakeSearch'] = true;
        }
        
        $builder = $voterHistories->search($query, $args);
        $response = new Fluent($builder->raw());
        
        $this->setCounts($response->facetDistribution ?? [], $response->facetStats ?? []);

        $pagination = new LengthAwarePaginator(
            VoterHistoryData::collect($response->hits ?? []),
            $response->estimatedTotalHits ?? 0,
            $limit,
            $page,
            [
                'pageName' => VoteSearchParams::PAGE()->value,
            ]
        );

        return $pagination->onEachSide(1)->toArray();
    }

    /**
     * Generate MeiliSearch filter expressions from query parameters
     */
    protected function getUserFilters(): array
    {
        $filters = [];
        if (isset($this->queryParams[VoteSearchParams::CHOICE()->value]) && $this->queryParams[VoteSearchParams::CHOICE()->value] !== null && $this->queryParams[VoteSearchParams::CHOICE()->value] !== '') {
            $choices = $this->queryParams[VoteSearchParams::CHOICE()->value];

            if (is_string($choices) && str_contains($choices, ',')) {
                $choiceArray = explode(',', $choices);
            } elseif (is_array($choices)) {
                $choiceArray = $choices;
            } else {
                $choiceArray = [$choices];
            }
            
            $choiceArray = array_filter(array_map('trim', $choiceArray), function($value) {
                return $value !== '' && $value !== null;
            });
            
            
            if (!empty($choiceArray)) {
                if (count($choiceArray) === 1) {
                    $filters[] = "choice = {$choiceArray[0]}";
                } else {
                    $choicesStr = implode(',', $choiceArray);
                    $filters[] = "choice IN [{$choicesStr}]";
                }
            }
        }
        
        if (isset($this->queryParams[VoteSearchParams::FUND()->value]) && $this->queryParams[VoteSearchParams::FUND()->value] !== null && $this->queryParams[VoteSearchParams::FUND()->value] !== '') {
            $fund = $this->queryParams[VoteSearchParams::FUND()->value];

            if (is_string($fund) && str_contains($fund, ',')) {
                $fundArray = explode(',', $fund);
            } elseif (is_array($fund)) {
                $fundArray = $fund;
            } else {
                $fundArray = [$fund];
            }
            
            $fundArray = array_filter(array_map('trim', $fundArray), function($value) {
                return $value !== '' && $value !== null;
            });

            if (!empty($fundArray)) {
                $funds = implode("','", $fundArray);
                $filters[] = "fund IN ['{$funds}']";
            }
        }
        
        return $filters;
    }

    /**
     * Set facet counts from MeiliSearch response
     */
    public function setCounts($facets, $facetStats)
    {
        if (isset($facets['choice'])) {
            $this->choice = $facets['choice'];
        }
        
        if (isset($facets['fund'])) {
            $this->funds = $facets['fund'];
        }
    }

    /**
     * Get unique choice values for filter dropdown
     */
    public function getChoices()
    {
        $choices = VoterHistory::select('choice')
            ->distinct()
            ->whereNotNull('choice')
            ->orderBy('choice')
            ->pluck('choice')
            ->map(function($choice) {
                $label = is_numeric($choice) ? "{$choice}" : $choice;
                
                return [
                    'id' => $choice,
                    'name' => $label,
                    'hash' => $choice
                ];
            });

        return response()->json($choices);
    }
}
