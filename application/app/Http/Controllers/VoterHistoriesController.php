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
            'sort' => "{$this->sortBy}:{$this->sortOrder}",
            'filters' => $this->queryParams,
        ];

        // dd([
        //     'voterHistories' => $voterHistories,
        //     'search' => $this->search,
        //     'sort' => "{$this->sortBy}:{$this->sortOrder}",
        //     'filters' => $this->queryParams,
        // ]);

        return Inertia::render('Votes/Index', $props);
    }

    /**
     * Process request parameters and set controller properties
     */
    protected function getProps(Request $request)
    {
        // Validate only short form parameters
        $this->queryParams = $request->validate([
            'c' => 'nullable', // Choice
            'f' => 'nullable', // Fund
            'p' => 'int|nullable', // Page
            'l' => 'int|nullable', // Limit
            'st' => 'nullable', // Sorts
            'q' => 'string|nullable', // Query
        ]);
        
        if (!empty($this->queryParams['st'])) {
            $sort = collect(explode(':', $this->queryParams['st']))->filter();
            $this->sortBy = $sort->first();
            $this->sortOrder = $sort->last();
        }
        
        if (isset($this->queryParams['q'])) {
            $this->search = $this->queryParams['q'];
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

        $page = isset($this->queryParams['p'])
            ? (int) $this->queryParams['p']
            : 1;

        $limit = isset($this->queryParams['l'])
            ? (int) $this->queryParams['l']
            : 9;

        $args['offset'] = ($page - 1) * $limit;
        $args['limit'] = $limit;

        $voterHistories = app(VoterHistoryRepository::class);
        
        $query = $this->queryParams['q'] ?? '';
        
        $builder = $voterHistories->search($query, $args);
        $response = new Fluent($builder->raw());
        
        $this->setCounts($response->facetDistribution ?? [], $response->facetStats ?? []);

        $pagination = new LengthAwarePaginator(
            VoterHistoryData::collect($response->hits ?? []),
            $response->estimatedTotalHits ?? 0,
            $limit,
            $page,
            [
                'pageName' => 'p',
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
        if (!empty($this->queryParams['c'])) {
            $choices = $this->queryParams['c'];

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
            
            Log::info('Processing choices filter', ['choiceArray' => $choiceArray]);
            
            if (!empty($choiceArray)) {
                if (count($choiceArray) === 1) {
                    $filters[] = "choice = {$choiceArray[0]}";
                } else {
                    $choicesStr = implode(',', $choiceArray);
                    $filters[] = "choice IN [{$choicesStr}]";
                }
            }
        }
        
        if (!empty($this->queryParams['f'])) {
            $fund = $this->queryParams['f'];

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
