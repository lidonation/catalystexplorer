<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\DataTransferObjects\GroupData;
use App\DataTransferObjects\ProposalData;
use App\Enums\ProposalSearchParams;
use App\Models\Group;
use App\Repositories\GroupRepository;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Fluent;
use Illuminate\Support\Stringable;
use Inertia\Inertia;
use Inertia\Response;
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



    public function index(Request $request): Response
    {
        $this->getProps($request);
        
        $groups = $this->query();
        $props = [
            'groups' => Inertia::optional(
                fn () => $groups
            ),
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
        return Inertia::render('Groups/Group', [
            'group' => GroupData::from($group),
            'proposals' => ProposalData::collect($group->proposals()->with(['users', 'fund'])->paginate()),
        ]);
    }

    protected function getProps(Request $request): void
    {
        $this->queryParams = $request->validate([
            ProposalSearchParams::FUNDED_PROPOSALS()->value => 'array|nullable',
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

    // protected function setFilters(Request $request)
    // {
    //     $this->limit = (int) $request->input(ProposalSearchParams::LIMIT, 24);
    //     $this->currentPage = (int) $request->input(ProposalSearchParams::PAGE, 1);
    //     $this->search = $request->input('s', null);
    //     $this->search = $request->input(ProposalSearchParams::QUERY, null);

    //     $sort = collect(explode(':', $request->input(ProposalSearchParams::SORTS, '')))->filter();
    //     if ($sort->isEmpty()) {
    //         $sort = collect(explode(':', collect([
    //             'name:asc',
    //             'name:desc',
    //             'amount_awarded_ada:desc',
    //             'amount_awarded_ada:asc',
    //             'amount_awarded_usd:desc',
    //             'amount_awarded_usd:asc',
    //         ])->random()));
    //     }

    //     $this->sortBy = $sort->first();
    //     $this->sortOrder = $sort->last();
    //     $this->fundedProposalsFilter = (bool) $request->input(ProposalSearchParams::FUNDED_PROPOSALS, false);
    //     $this->awardedUsdFilter = $request->collect(ProposalSearchParams::AWARDED_USD);
    //     $this->awardedAdaFilter = $request->collect(ProposalSearchParams::AWARDED_ADA);
    //     $this->fundsFilter = $request->collect(ProposalSearchParams::FUNDS)->map(fn($n) => intval($n));
    //     $this->tagsFilter = $request->collect(ProposalSearchParams::TAGS)->map(fn($n) => intval($n));
    //     $this->ideascaleProfileFilter = $request->collect(ProposalSearchParams::IDEASCALE_PROFILES)->map(fn($n) => intval($n));
    // }

    public function query($returnBuilder = false, $attrs = null, $filters = [])
    {
        $_options = [
            'filters' => array_merge([], $this->getUserFilters(), $filters),
        ];

        $page = (int) ($this->queryParams[ProposalSearchParams::PAGE()->value] ?? 1);
        $limit = (int) ($this->queryParams[ProposalSearchParams::LIMIT()->value] ?? 36);

        $this->searchBuilder = Group::search(
            $this->search,
            function (Indexes $index, $query, $options) use ($_options, $attrs, $page, $limit) {
                if (!empty($_options['filters'])) {
                    $options['filter'] = implode(' AND ', $_options['filters']);
                }

                $options['attributesToRetrieve'] = $attrs ?? [
                    'id',
                    'name',
                    'discord',
                    'twitter',
                    'website',
                    'github',
                    'link',
                    'amount_received',
                    'thumbnail_url',
                    'amount_awarded_ada',
                    'amount_awarded_usd',
                    'gravatar',
                ];
                $options['facets'] = [
                    'tags.id',
                    'proposals.fund.title',
                ];

                if ($this->sortBy && $this->sortOrder) {
                    $options['sort'] = ["$this->sortBy:$this->sortOrder"];
                }

                $options['offset'] = ($page - 1) * $limit;
                $options['limit'] = $limit;

                return $index->search($query, $options);
            }
        );


        if ($returnBuilder) {
            return $this->searchBuilder;
        }

        $response = new Fluent($this->searchBuilder->raw());


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

    #[ArrayShape(['filters' => 'array'])]
    protected function getUserFilters(): array
    {


        $filters = [];


        if ((bool) $this->fundedProposalsFilter) {
            $_options[] = 'proposals_funded > 0';
        }

        // Fund filter
        if (! empty($this->queryParams[ProposalSearchParams::FUNDS()->value])) {
            $funds = implode("','", $this->queryParams[ProposalSearchParams::FUNDS()->value]);
            $filters[] = "proposals.fund.title IN ['{$funds}']";
        }

        if (! empty($this->queryParams[ProposalSearchParams::FUNDED_PROPOSALS()->value])) {
            $fundedProposals = implode("','", $this->queryParams[ProposalSearchParams::FUNDED_PROPOSALS()->value]);
            $filters[] = "funded_proposals IN ['{$fundedProposals}']";
        }

        if (! empty($this->queryParams[ProposalSearchParams::AWARDED_USD()->value])) {
            $awardedUsd = collect((object) $this->queryParams[ProposalSearchParams::AWARDED_USD()->value]);
            $filters[] = "(awarded_usd  {$awardedUsd->first()} TO  {$awardedUsd->last()})";
        }

        if (! empty($this->queryParams[ProposalSearchParams::AWARDED_ADA()->value])) {
            $awardedAda = collect((object) $this->queryParams[ProposalSearchParams::AWARDED_ADA()->value]);
            $filters[] = "(awarded_ada  {$awardedAda->first()} TO  {$awardedAda->last()})";
        }

        if (! empty($this->queryParams[ProposalSearchParams::CAMPAIGNS()->value])) {
            $campaignIds = ($this->queryParams[ProposalSearchParams::CAMPAIGNS()->value]);
            $filters[] = '(' . implode(' OR ', array_map(fn($c) => "campaign.id = {$c}", $campaignIds)) . ')';
        }

        if (! empty($this->queryParams[ProposalSearchParams::TAGS()->value])) {
            $tagIds = ($this->queryParams[ProposalSearchParams::TAGS()->value]);
            $filters[] = '(' . implode(' OR ', array_map(fn($c) => "tags.id = {$c}", $tagIds)) . ')';
        }

        if (! empty($this->queryParams[ProposalSearchParams::IDEASCALE_PROFILES()->value])) {
            $ideascaleProfileIds = implode(',', $this->queryParams[ProposalSearchParams::IDEASCALE_PROFILES()->value]);
            $filters[] = "users.id IN [{$ideascaleProfileIds}]";
        }

        if (! empty($this->queryParams[ProposalSearchParams::COMMUNITIES()->value])) {
            $communityIds = implode(',', $this->queryParams[ProposalSearchParams::COMMUNITIES()->value]);
            $filters[] = "communities.id IN [{$communityIds}]";
        }

        if (! empty($this->queryParams[ProposalSearchParams::COHORT()->value])) {
            $cohortFilters = array_map(fn($cohort) => "{$cohort} = 1", $this->queryParams[ProposalSearchParams::COHORT()->value]);
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
}
