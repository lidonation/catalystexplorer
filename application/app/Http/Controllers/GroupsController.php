<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\DataTransferObjects\GroupData;
use App\DataTransferObjects\IdeascaleProfileData;
use App\DataTransferObjects\LocationData;
use App\DataTransferObjects\ProposalData;
use App\DataTransferObjects\ReviewData;
use App\Enums\ProposalSearchParams;
use App\Models\Group;
use App\Models\IdeascaleProfile;
use App\Repositories\GroupRepository;
use App\Repositories\ReviewRepository;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Fluent;
use Illuminate\Support\Stringable;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Scout\Builder;

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

    public array $proposalsCount = [];

    public array $totalAwardedAda = [];

    public array $totalAwardedUsd = [];

    public array $fundsCount = [];

    public function index(Request $request): Response
    {
        $this->getProps($request);

        $groups = $this->query();

        return Inertia::render('Groups/Index', [
            'groups' => app()->environment('testing')
                ? $groups
                : Inertia::optional(fn () => $groups),
            'search' => $this->search,
            'sort' => "{$this->sortBy}:{$this->sortOrder}",
            'filters' => $this->queryParams,
            'funds' => $this->fundsCount,
            'filterCounts' => [
                'proposalsCount' => ! empty($this->proposalsCount)
                    ? round(max(array_keys($this->proposalsCount)), -1)
                    : 0,
                'totalAwardedAda' => ! empty($this->totalAwardedAda)
                    ? max($this->totalAwardedAda)
                    : 0,
                'totalAwardedUsd' => ! empty($this->totalAwardedUsd)
                    ? max($this->totalAwardedUsd)
                    : 0,
            ],
        ]);
    }

    public function myGroups(Request $request): Response
    {
        $userId = $request->user()->id;

        $groups = Cache::remember("user-groups:{ $userId }", now()->addMinutes(10), function () use ($userId) {
            return IdeascaleProfile::where('claimed_by_id', operator: $userId)->get()->flatMap(fn ($p) => $p->groups);
        });

        $props = [
            'groups' => Inertia::optional(
                fn () => GroupData::collect($groups)
            ),
        ];

        return Inertia::render('My/Groups/Index', $props);
    }

    public function group(Request $request, Group $group, ReviewRepository $reviewRepository): Response
    {

        $groupData = Cache::remember("group:{$group->hash}:with_counts", now()->addMinutes(10), function () use ($group) {
            $group->load(['proposals'])->loadCount([
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

            return GroupData::from($group);
        });

        $cacheKey = "group:{$group->hash}:proposals_data";

        [
            'proposals' => $proposals,
            'reviews' => $reviews,
            'aggregatedRatings' => $aggregatedRatings,
            'ideascaleProfiles' => $ideascaleProfiles
        ] = Cache::remember($cacheKey, now()->addMinutes(10), function () use ($reviewRepository, $group) {
            $args = [
                'filter' => ["proposal.groups.hash = {$group->hash}"],
                'attributesToRetrieve' => ['*'],
            ];

            $proposals = $group->proposals;

            $ideascaleProfiles = $group->ideascale_profiles()->withCount('proposals')->get();

            $builder = $reviewRepository->search('', $args);

            $reviews = $builder->raw()['hits'] ?? [];
            $ratings = collect($reviews)->map(fn ($p) => $p['rating'])->groupBy('rating');
            $aggregatedRatings = $ratings->mapWithKeys(fn ($r, $k) => [$k => $r->count()]);

            return compact('proposals', 'reviews', 'aggregatedRatings', 'ideascaleProfiles');
        });

        $props = [
            'group' => $groupData,

            'proposals' => fn () => to_length_aware_paginator(
                ProposalData::collect($proposals),
                perPage: 11,
                currentPage: 1
            )->onEachSide(0),

            'connections' => Inertia::optional(fn () => $group->connected_items),

            'ideascaleProfiles' => Inertia::optional(
                fn () => to_length_aware_paginator(
                    IdeascaleProfileData::collect($ideascaleProfiles),
                    total: count($ideascaleProfiles),
                    perPage: 11,
                    currentPage: 1
                )
            ),

            'locations' => Inertia::optional(
                fn () => to_length_aware_paginator(
                    LocationData::collect($group->locations()->paginate(12))
                )
            ),

            'reviews' => Inertia::optional(
                fn () => to_length_aware_paginator(
                    ReviewData::collect(collect($reviews)->take(11)),
                    total: count($reviews),
                    perPage: 11,
                    currentPage: 1
                )
            ),

            'aggregatedRatings' => $aggregatedRatings,
        ];

        return match (true) {
            str_contains($request->path(), '/connections') => Inertia::render('Groups/Connections/Index', $props),
            str_contains($request->path(), '/ideascale-profiles') => Inertia::render('Groups/IdeascaleProfiles/Index', $props),
            str_contains($request->path(), '/reviews') => Inertia::render('Groups/Reviews/Index', $props),
            str_contains($request->path(), '/locations') => Inertia::render('Groups/Locations/Index', $props),
            default => Inertia::render('Groups/Proposals/Index', $props),
        };
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

    public function query(): array
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

        $args['offset'] = $page;
        $args['limit'] = $limit;

        $groups = app(GroupRepository::class);

        $builder = $groups->search(
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
            $campaignHashes = ($this->queryParams[ProposalSearchParams::CAMPAIGNS()->value]);
            $filters[] = '('.implode(' OR ', array_map(fn ($c) => "proposals.campaign.hash = {$c}", $campaignHashes)).')';
        }

        if (! empty($this->queryParams[ProposalSearchParams::TAGS()->value])) {
            $tagHashes = ($this->queryParams[ProposalSearchParams::TAGS()->value]);
            $filters[] = '('.implode(' OR ', array_map(fn ($c) => "tags.hash = {$c}", $tagHashes)).')';
        }

        if (! empty($this->queryParams[ProposalSearchParams::IDEASCALE_PROFILES()->value])) {
            $ideascaleProfileHashes = implode(',', $this->queryParams[ProposalSearchParams::IDEASCALE_PROFILES()->value]);

            $filters[] = "ideascale_profiles.hash IN [{$ideascaleProfileHashes}]";
        }

        if (! empty($this->queryParams[ProposalSearchParams::COMMUNITIES()->value])) {
            $communityHashes = implode(',', $this->queryParams[ProposalSearchParams::COMMUNITIES()->value]);
            $filters[] = "proposals.communities.hash IN [{$communityHashes}]";
        }

        if (! empty($this->queryParams[ProposalSearchParams::COHORT()->value])) {
            $cohortFilters = array_map(fn ($cohort) => "{$cohort} > 0", $this->queryParams[ProposalSearchParams::COHORT()->value]);
            $filters[] = '('.implode(' OR ', $cohortFilters).')';
        }

        return $filters;
    }

    public function setCounts($facets, $facetStats)
    {

        if (isset($facets['tags.id']) && count($facets['tags.id'])) {
            $this->tagsCount = $facets['tags.id'];
        }

        if (isset($facets['proposals_count']) && count($facets['proposals_count'])) {
            $this->proposalsCount = $facets['proposals_count'];
        }

        if (isset($facets['amount_awarded_ada']) && count($facets['amount_awarded_ada'])) {
            $this->totalAwardedAda = array_keys($facets['amount_awarded_ada']);
        }

        if (isset($facets['amount_awarded_usd']) && count($facets['amount_awarded_usd'])) {
            $this->totalAwardedUsd = array_keys($facets['amount_awarded_usd']);
        }

        if (isset($facets['proposals.fund.title']) && count($facets['proposals.fund.title'])) {
            $this->fundsCount = $facets['proposals.fund.title'];
        }
    }
}
