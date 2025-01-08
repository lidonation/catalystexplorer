<?php declare(strict_types=1);

namespace App\Http\Controllers;

use App\Repositories\IdeascaleProfileRepository;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Enums\ProposalSearchParams;
use Laravel\Scout\Builder;
use Illuminate\Support\Fluent;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Log;

class IdeascaleProfilesController extends Controller
{
    /**
     * Display the user's profile form.
     */
    protected int $limit = 40;
    protected int $currentPage = 1;
    protected array $queryParams = [];
    
    public function index(Request $request): Response
    {
        Log::info('Received request with params:', [
            'all_params' => $request->all()
        ]);

        $this->getProps($request);
        $profiles = empty($this->queryParams) ? $this->getIdeascaleProfilesData() : $this->query();

        return Inertia::render('IdeascaleProfile/Index', [
            'ideascaleProfiles' => $profiles,
            'filters' => $this->queryParams
        ]);
    }

    public function getIdeascaleProfilesData()
    {
        $limit = (int) $this->limit;
        $page = (int) $this->currentPage;
        $ideascaleProfiles = app(IdeascaleProfileRepository::class);
        return $ideascaleProfiles->getQuery()->inRandomOrder()->limit($this->limit)->get();
    }

    protected function getProps(Request $request): void
    {
        $this->queryParams = $request->validate([
            ProposalSearchParams::FUNDS()->value => 'array|nullable',
            ProposalSearchParams::PROJECT_STATUS()->value => 'array|nullable',
            ProposalSearchParams::TAGS()->value => 'array|nullable',
            ProposalSearchParams::FUNDING_STATUS()->value => 'string|nullable', // Make sure this matches your enum value
            ProposalSearchParams::BUDGETS()->value => 'array|nullable',
            ProposalSearchParams::PAGE()->value => 'int|nullable',
            ProposalSearchParams::LIMIT()->value => 'int|nullable',
        ]);

        // Convert funding status to boolean explicitly
        if (isset($this->queryParams[ProposalSearchParams::FUNDING_STATUS()->value])) {
            $this->queryParams[ProposalSearchParams::FUNDING_STATUS()->value] = 
                filter_var($this->queryParams[ProposalSearchParams::FUNDING_STATUS()->value], FILTER_VALIDATE_BOOLEAN);
        }

        // Set default budget range if not provided
        if (empty($this->queryParams[ProposalSearchParams::BUDGETS()->value])) {
            $this->queryParams[ProposalSearchParams::BUDGETS()->value] = [1000, 10000000];
        }
    }

    protected function query(): array
    {
        $filters = $this->getUserFilters();
        // dd($profiles);
        
        $args = [
            'filter' => $this->getUserFilters(),
        ];

        Log::info('Constructed search arguments:', [
            'args' => $args,
            'filters' => $filters
        ]);

        $page = $this->queryParams[ProposalSearchParams::PAGE()->value] ?? 1;
        $limit = $this->queryParams[ProposalSearchParams::LIMIT()->value] ?? $this->limit;

        $args['offset'] = ($page - 1) * $limit;
        $args['limit'] = $limit;

        $profiles = app(IdeascaleProfileRepository::class);
        $builder = $profiles->search('', $args);
        
        Log::info('Raw search response:', [
            'raw_response' => $builder->raw()
        ]);

        $response = new Fluent($builder->raw());

        // Paginate the results
        $pagination = new LengthAwarePaginator(
            $response->hits,
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
        
        try {
            // Fund filter
            if (!empty($this->queryParams[ProposalSearchParams::FUNDS()->value])) {
                $funds = implode("','", $this->queryParams[ProposalSearchParams::FUNDS()->value]);
                $filters[] = "proposals.fund.title IN ['{$funds}']";
            }

            // Project status filter
            if (isset($this->queryParams[ProposalSearchParams::PROJECT_STATUS()->value])) {
                $projectStatuses = implode(',', $this->queryParams[ProposalSearchParams::PROJECT_STATUS()->value]);
                $filters[] = "proposals.status IN [{$projectStatuses}]";
            }

            // Tags filter
            if (!empty($this->queryParams[ProposalSearchParams::TAGS()->value])) {
                $tagIds = array_map('intval', $this->queryParams[ProposalSearchParams::TAGS()->value]);
                $filters[] = '(' . implode(' OR ', array_map(fn($t) => "proposals.tags.id = {$t}", $tagIds)) . ')';
            }

            // Funding status filter
            if (isset($this->queryParams[ProposalSearchParams::FUNDING_STATUS()->value])) {
                $fundingStatus = $this->queryParams[ProposalSearchParams::FUNDING_STATUS()->value] ? 'funded' : 'unfunded';
                $filters[] = "proposals.funding_status = '{$fundingStatus}'";
            }

            // filter by budget range
            if (!empty($this->queryParams[ProposalSearchParams::BUDGETS()->value])) {
                $budgetRange = collect((object) $this->queryParams[ProposalSearchParams::BUDGETS()->value]);
                $filters[] = "(proposals_total_amount_requested  {$budgetRange->first()} TO  {$budgetRange->last()})";
            }

            Log::info('Generated filters:', [
                'filters' => $filters,
                'queryParams' => $this->queryParams
            ]);

        } catch (\Exception $e) {
            Log::error('Error generating filters:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }

        return $filters;
    }
}
