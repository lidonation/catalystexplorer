<?php

declare(strict_types=1);

namespace App\Interfaces\Http\Controllers;

use App\Actions\TransformIdsToHashes;
use App\Enums\IdeascaleProfileSearchParams;
use App\Enums\ProposalSearchParams;
use App\Models\IdeascaleProfile;
use App\Repositories\IdeascaleProfileRepository;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Fluent;
use Inertia\Inertia;
use Inertia\Response;

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
        $this->getProps($request);

        return Inertia::render('IdeascaleProfile/Index', [
            'ideascaleProfilesCount' => 4,
            'ideascaleProfiles' => Inertia::defer(fn () => $this->query()),
            'filters' => $this->queryParams,
        ]);
    }

    public function show(Request $request, IdeascaleProfile $ideascaleProfile): Response
    {
        $ideascaleProfile
            ->loadCount([
                'completed_proposals',
                'funded_proposals',
                'unfunded_proposals',
                'proposals',
            ])->append([
                'amount_distributed_ada',
                'amount_distributed_usd',
                'amount_awarded_ada',
                'amount_awarded_usd',
                'amount_requested_ada',
                'amount_requested_usd',
            ]);

        $connections = $ideascaleProfile->connected_items;

        return Inertia::render('IdeascaleProfile/IdeascaleProfile', [
            'ideascaleProfile' => $ideascaleProfile,
            'connections' => $connections,
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
            'attributesToRetrieve' => $attrs ?? [
                'id',
                'name',
                'profile_photo_url',
                'first_timer',
                'completed_proposals_count',
                'funded_proposals_count',
                'unfunded_proposals_count',
                'proposals_count',
                'collaborating_proposals_count',
                'own_proposals_count',
                'amount_awarded_ada',
                'amount_awarded_usd',
                'proposals_funded',
                'proposals_total_amount_requested',
            ],
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

        $items = collect($response->hits);
        $pagination = new LengthAwarePaginator(
            (new TransformIdsToHashes)(
                collection: $items,
                model: new IdeascaleProfile
            )->toArray(),
            $response->estimatedTotalHits,
            $limit,
            $page,
            [
                'pageName' => 'p',
                'onEachSide' => 0,
            ]
        );

        return $pagination->toArray();
    }

    protected function getProps(Request $request): void
    {
        $this->queryParams = $request->validate([
            ProposalSearchParams::FUNDS()->value => 'array|nullable',
            ProposalSearchParams::PROJECT_STATUS()->value => 'array|nullable',
            ProposalSearchParams::TAGS()->value => 'array|nullable',
            ProposalSearchParams::FUNDING_STATUS()->value => 'array|nullable',
            ProposalSearchParams::BUDGETS()->value => 'array|nullable',
            ProposalSearchParams::PAGE()->value => 'int|nullable',
            ProposalSearchParams::LIMIT()->value => 'int|nullable',

            IdeascaleProfileSearchParams::QUERY()->value => 'string|nullable',
            IdeascaleProfileSearchParams::SORT()->value => 'string|nullable',
        ]);
    }

    protected function getUserFilters(): array
    {
        $filters = [];

        try {
            // Fund filter
            if (! empty($this->queryParams[ProposalSearchParams::FUNDS()->value])) {
                $funds = implode("','", $this->queryParams[ProposalSearchParams::FUNDS()->value]);
                $filters[] = "proposals.fund.title IN ['{$funds}']";
            }

            // Project status filter
            if (isset($this->queryParams[ProposalSearchParams::PROJECT_STATUS()->value])) {
                $projectStatuses = implode(',', $this->queryParams[ProposalSearchParams::PROJECT_STATUS()->value]);
                $filters[] = "proposals.status IN [{$projectStatuses}]";
            }

            // Tags filter
            if (! empty($this->queryParams[ProposalSearchParams::TAGS()->value])) {
                $tagIds = array_map('intval', $this->queryParams[ProposalSearchParams::TAGS()->value]);
                $filters[] = '('.implode(' OR ', array_map(fn ($t) => "proposals.tags.id = {$t}", $tagIds)).')';
            }

            // Funding status filter
            if (isset($this->queryParams[ProposalSearchParams::FUNDING_STATUS()->value])) {
                $fundingStatus = implode(',', $this->queryParams[ProposalSearchParams::FUNDING_STATUS()->value]);
                $filters[] = "proposals.funding_status = '{$fundingStatus}'";
            }

            // filter by budget range
            if (! empty($this->queryParams[ProposalSearchParams::BUDGETS()->value])) {
                $budgetRange = collect((object) $this->queryParams[ProposalSearchParams::BUDGETS()->value]);
                $filters[] = "(proposals_total_amount_requested  {$budgetRange->first()} TO  {$budgetRange->last()})";
            }
        } catch (\Exception $e) {
            Log::error('Error generating filters:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
        }

        return $filters;
    }
}
