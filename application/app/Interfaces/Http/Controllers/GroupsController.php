<?php

declare(strict_types=1);

namespace App\Interfaces\Http\Controllers;

use App\DataTransferObjects\ConnectionData;
use App\DataTransferObjects\GroupData;
use App\DataTransferObjects\IdeascaleProfileData;
use App\DataTransferObjects\LocationData;
use App\DataTransferObjects\ProposalData;
use App\DataTransferObjects\ReviewData;
use App\Enums\ProposalSearchParams;
use App\Models\Fund;
use App\Models\Group;
use App\Models\Review;
use App\Repositories\GroupRepository;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Fluent;
use Illuminate\Support\Stringable;
use Inertia\Inertia;
use Inertia\Response;
use JetBrains\PhpStorm\ArrayShape;
use Laravel\Scout\Builder;
use Meilisearch\Endpoints\Indexes;

class GroupsController extends Controller
{
    protected int $currentPage;

    protected int $limit = 24;

    protected array $queryParams = [];

    protected null|string|Stringable $search = null;

    protected ?string $sortBy = 'name';

    protected ?string $sortOrder = 'desc';

    protected ?bool $fundedProposalsFilter = false;

    protected Collection $awardedUsdFilter;

    protected Collection $awardedAdaFilter;

    public $fundsFilter;

    public $tagsFilter;

    public $ideascaleProfileFilter;

    protected Builder $searchBuilder;

    public array $tagsCount = [];

    public array $fundsCount = [];

    public int $proposalsCount;



    public function index(Request $request): Response
    {
        $this->getProps($request);

        $groups = $this->query();

        $props = [
            'groups' => $groups,
            'search' => $this->search,
            'sort' => "{$this->sortBy}:{$this->sortOrder}",
            'filters' => $this->queryParams,
            'filterCounts' => [
                'tagsCount' => $this->tagsCount,
                'fundsCount' => $this->fundsCount,
            ],
        ];

        return Inertia::render('Groups/Index', $props);
    }

    public function group(Request $request, Group $group, GroupRepository $groupRepository): Response
    {
        $group->load('proposals')
            ->loadCount([
                'proposals',
                'funded_proposals',
                'unfunded_proposals',
                'completed_proposals',
            ])->append([
                'amount_awarded_ada',
                'amount_awarded_usd',
                'amount_requested_ada',
                'amount_requested_usd',
                'amount_distributed_ada',
                'amount_distributed_usd',
                'connected_items',
            ]);

        return Inertia::render('Groups/Group', [
            'group' => GroupData::from($group),
            'proposals' => Inertia::optional(
                fn() => to_length_aware_paginator(
                    ProposalData::collect(
                        $group->proposals()->with(['users', 'fund'])->paginate(5)
                    )
                )
            ),
            //            'ideascaleProfiles' => [],
            'ideascaleProfiles' => Inertia::optional(
                fn() => to_length_aware_paginator(
                    IdeascaleProfileData::collect(
                        $group->ideascale_profiles()->with([])->paginate(12)
                    )
                )
            ),
            'reviews' => Inertia::optional(
                fn() => to_length_aware_paginator(
                    ReviewData::collect(
                        Review::query()->paginate(8)
                    )
                )
            ),
            'locations' => Inertia::optional(
                fn() => to_length_aware_paginator(
                    LocationData::collect(
                        $group->locations()->with([])->paginate(12)
                    )
                )
            ),
            //            'connections' => [],
            'connections' => Inertia::optional(
                fn() => ConnectionData::collect(
                    $group->connected_items
                )
            ),
        ]);
    }

    protected function getProps(Request $request): void
    {
        $this->queryParams = $request->validate([
            ProposalSearchParams::FUNDING_STATUS()->value => 'array|nullable',
            ProposalSearchParams::PROJECT_STATUS()->value => 'array|nullable',
            ProposalSearchParams::QUERY()->value => 'string|nullable',
            ProposalSearchParams::COHORT()->value => 'array|nullable',
            ProposalSearchParams::PAGE()->value => 'int|nullable',
            ProposalSearchParams::LIMIT()->value => 'int|nullable',
            ProposalSearchParams::SORTS()->value => 'nullable',
            ProposalSearchParams::CAMPAIGNS()->value => 'array|nullable',
            ProposalSearchParams::TAGS()->value => 'array|nullable',
            ProposalSearchParams::COMMUNITIES()->value => 'array|nullable',
            ProposalSearchParams::IDEASCALE_PROFILES()->value => 'array|nullable',
            ProposalSearchParams::FUNDS()->value => 'array|nullable',
            ProposalSearchParams::PROPOSALS()->value => 'array|nullable',
            ProposalSearchParams::AWARDED_ADA()->value => 'array|nullable',
            ProposalSearchParams::AWARDED_USD()->value => 'array|nullable',     
        ]);

        // format sort params for meili
        if (! empty($this->queryParams[ProposalSearchParams::SORTS()->value])) {
            $sort = collect(
                explode(
                    ':',
                    $this->queryParams[ProposalSearchParams::SORTS()->value]
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

        $page = isset($this->queryParams[ProposalSearchParams::PAGE()->value])
            ? (int) $this->queryParams[ProposalSearchParams::PAGE()->value]
            : 1;

        $limit = isset($this->queryParams[ProposalSearchParams::LIMIT()->value])
            ? (int) $this->queryParams[ProposalSearchParams::LIMIT()->value]
            : 36;

        $args['offset'] = ($page - 1) * $limit;
        $args['limit'] = $limit;

        $proposals = app(GroupRepository::class);

        $builder = $proposals->search(
            $this->queryParams[ProposalSearchParams::QUERY()->value] ?? '',
            $args
        );

        $response = new Fluent($builder->raw());

        $this->setCounts($response->facetDistribution, $response->facetStats);

        $pagination = new LengthAwarePaginator(
            GroupData::collect($response->hits),
            $response->estimatedTotalHits,
            $limit,
            $page,
            [
                'pageName' => 'p',
            ]
        );

        return $pagination->onEachSide(1)->toArray();
    }

    // #[ArrayShape(['filters' => 'array'])]
    protected function getUserFilters(): array
    {


        $filters = [];

        if (! empty($this->queryParams[ProposalSearchParams::FUNDS()->value])) {
            $funds = implode("','", $this->queryParams[ProposalSearchParams::FUNDS()->value]);
            $filters[] = "proposals.fund.title IN ['{$funds}']";
        }
        

        if (isset($this->queryParams[ProposalSearchParams::FUNDING_STATUS()->value])) {
            $fundingStatuses = implode(',', $this->queryParams[ProposalSearchParams::FUNDING_STATUS()->value]);
            $filters[] = "proposals.funding_status IN [{$fundingStatuses}]";
        }

        if (isset($this->queryParams[ProposalSearchParams::PROJECT_STATUS()->value])) {
            $projectStatuses = implode(',', $this->queryParams[ProposalSearchParams::PROJECT_STATUS()->value]);
            $filters[] = "proposals.status IN [{$projectStatuses}]";
        }

        if (! empty($this->queryParams[ProposalSearchParams::AWARDED_USD()->value])) {
            $awardedUsd = collect((object) $this->queryParams[ProposalSearchParams::AWARDED_USD()->value]);
            $filters[] = "(amount_awarded_usd  {$awardedUsd->first()} TO  {$awardedUsd->last()})";
        }

        if (! empty($this->queryParams[ProposalSearchParams::AWARDED_ADA()->value])) {
            $awardedAda = collect((object) $this->queryParams[ProposalSearchParams::AWARDED_ADA()->value]);
            $filters[] = "(amount_awarded_ada  {$awardedAda->first()} TO  {$awardedAda->last()})";
        }

        if (! empty($this->queryParams[ProposalSearchParams::PROPOSALS()->value])) {
            $proposalsCount = collect((object) $this->queryParams[ProposalSearchParams::PROPOSALS()->value]);
            $filters[] = "(proposals_count {$proposalsCount->first()} TO  {$proposalsCount->last()})";
        }

        if (! empty($this->queryParams[ProposalSearchParams::CAMPAIGNS()->value])) {
            $campaignIds = ($this->queryParams[ProposalSearchParams::CAMPAIGNS()->value]);
            $filters[] = '(' . implode(' OR ', array_map(fn($c) => "proposals.campaign.id = {$c}", $campaignIds)) . ')';
        }

        if (! empty($this->queryParams[ProposalSearchParams::TAGS()->value])) {
            $tagIds = ($this->queryParams[ProposalSearchParams::TAGS()->value]);
            $filters[] = '(' . implode(' OR ', array_map(fn($c) => "tags.id = {$c}", $tagIds)) . ')';
        }

        if (! empty($this->queryParams[ProposalSearchParams::IDEASCALE_PROFILES()->value])) {
            $ideascaleProfileIds = implode(',', $this->queryParams[ProposalSearchParams::IDEASCALE_PROFILES()->value]);
            $filters[] = "ideascale_profiles.id IN [{$ideascaleProfileIds}]";
        }

        if (! empty($this->queryParams[ProposalSearchParams::COMMUNITIES()->value])) {
            $communityIds = implode(',', $this->queryParams[ProposalSearchParams::COMMUNITIES()->value]);
            $filters[] = "proposals.communities.id IN [{$communityIds}]";
        }

        if (! empty($this->queryParams[ProposalSearchParams::COHORT()->value])) {
            $cohortFilters = array_map(fn($cohort) => "{$cohort} > 0", $this->queryParams[ProposalSearchParams::COHORT()->value]);
            $filters[] = '(' . implode(' OR ', $cohortFilters) . ')';
        }

        return $filters;
    }

    public function setCounts($facets, $facetStats)
    {

        if (isset($facets['tags.id']) && count($facets['tags.id'])) {
            $this->tagsCount = $facets['tags.id'];
        }

        if (isset($facets['proposals.fund.title']) && count($facets['proposals.fund.title'])) {
            $this->fundsCount = $facets['proposals.fund.title'];
        }
    }

    public function getFundsWithProposalsCount()
    {
        return Fund::withCount('proposals')->get()->mapWithKeys(function ($fund) {
            return [$fund->title => $fund->proposals_count];
        });
    }
}
