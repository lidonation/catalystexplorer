<?php

declare(strict_types=1);

namespace App\Interfaces\Http\Controllers;

use App\Actions\TransformIdsToHashes;
use App\DataTransferObjects\IdeascaleProfileData;
use App\DataTransferObjects\ProposalData;
use App\DataTransferObjects\ProposalMilestoneData;
use App\Enums\IdeascaleProfileSearchParams;
use App\Enums\ProposalSearchParams;
use App\Models\IdeascaleProfile;
use App\Models\ProposalMilestone;
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
        if (! $ideascaleProfile) {
            abort(404, 'Ideascale Profile not found');
        }

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

        $path = $request->path();

        if (str_contains($path, '/proposals')) {
            $proposalsPaginator = $ideascaleProfile->proposals()
                ->with(['users', 'fund'])
                ->paginate(perPage: 5);

            return Inertia::render('IdeascaleProfile/Proposals/Index', [
                'ideascaleProfile' => IdeascaleProfileData::from($ideascaleProfile),
                'proposals' => Inertia::lazy(fn () => [
                    'data' => ProposalData::collect($proposalsPaginator->items()),
                    'total' => $proposalsPaginator->total(),
                    'per_page' => $proposalsPaginator->perPage(),
                    'current_page' => $proposalsPaginator->currentPage(),
                    'last_page' => $proposalsPaginator->lastPage(),
                    'from' => $proposalsPaginator->firstItem(),
                    'to' => $proposalsPaginator->lastItem(),
                ]),
            ]);
        }

        if (str_contains($path, '/connections')) {
            return Inertia::render('IdeascaleProfile/Connections/Index', [
                'ideascaleProfile' => IdeascaleProfileData::from($ideascaleProfile),
                'connections' => Inertia::lazy(fn () => $ideascaleProfile->connected_items), // Use lazy loading
            ]);
        }

        if (str_contains($path, '/groups')) {
            return Inertia::render('IdeascaleProfile/Groups/Index', [
                'ideascaleProfile' => IdeascaleProfileData::from($ideascaleProfile),
            ]);
        }

        if (str_contains($path, '/communities')) {
            return Inertia::render('IdeascaleProfile/Communities/Index', [
                'ideascaleProfile' => IdeascaleProfileData::from($ideascaleProfile),
            ]);
        }

        if (str_contains($path, '/reviews')) {
            return Inertia::render('IdeascaleProfile/Reviews/Index', [
                'ideascaleProfile' => IdeascaleProfileData::from($ideascaleProfile),
            ]);
        }

        if (str_contains($path, '/milestones')) {

            $proposalMilestones = ProposalMilestone::whereHas('proposal', function ($query) use ($ideascaleProfile) {
                $query->has('users', $ideascaleProfile->id);
            })
                ->with(['proposal', 'milestones'])
                ->get();

            // $proposalMilestones = ProposalMilestone::whereHas('proposal', function ($query) use ($ideascaleProfile) {
            //     $query->whereIn('id', $ideascaleProfile->own_proposals->pluck('id'));
            // })
            //     ->with(['proposal', 'milestones'])
            //     ->get();

            return Inertia::render('IdeascaleProfile/Milestones/Index', [
                'ideascaleProfile' => IdeascaleProfileData::from($ideascaleProfile),
                'proposalMilestones' => Inertia::optional(fn () => ProposalMilestoneData::collect($proposalMilestones)),
            ]);
        }

        if (str_contains($path, '/reports')) {
            return Inertia::render('IdeascaleProfile/Reports/Index', [
                'ideascaleProfile' => IdeascaleProfileData::from($ideascaleProfile),
            ]);
        }

        if (str_contains($path, '/cam')) {
            return Inertia::render('IdeascaleProfile/Cam/Index', [
                'ideascaleProfile' => IdeascaleProfileData::from($ideascaleProfile),
            ]);
        }

        $proposalsPaginator = $ideascaleProfile->proposals()
            ->with(['users', 'fund'])
            ->paginate(perPage: 5);

        return Inertia::render('IdeascaleProfile/Proposals/Index', [
            'ideascaleProfile' => IdeascaleProfileData::from($ideascaleProfile),
            'proposals' => Inertia::lazy(fn () => [
                'data' => ProposalData::collect($proposalsPaginator->items()),
                'total' => $proposalsPaginator->total(),
                'per_page' => $proposalsPaginator->perPage(),
                'current_page' => $proposalsPaginator->currentPage(),
                'last_page' => $proposalsPaginator->lastPage(),
                'from' => $proposalsPaginator->firstItem(),
                'to' => $proposalsPaginator->lastItem(),
            ]),
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
                'hero_img_url',
                'first_timer',
                'claimed_by_id',
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
