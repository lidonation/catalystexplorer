<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\DataTransferObjects\GroupData;
use App\DataTransferObjects\ProposalData;
use App\Enums\QueryParamsEnum;
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
        $this->setFilters($request);

        $props = [
            'groups' => $this->query(),
            'search' => $this->search,
            'sort' => "{$this->sortBy}:{$this->sortOrder}",
            'currPage' => $this->currentPage,
            'perPage' => $this->limit,
            'filters' => [
                'currentPage' => $this->currentPage,
                'perPage' => $this->limit,
                'funded' => $this->fundedProposalsFilter,
                'awardedUsd' => $this->awardedUsdFilter->isNotEmpty() ? $this->awardedUsdFilter->toArray() : [0, 7000000],
                'awardedAda' => $this->awardedAdaFilter->isNotEmpty() ? $this->awardedAdaFilter->toArray() : [0, 7000000],
                'funds' => $this->fundsFilter->toArray(),
                'tags' => $this->tagsFilter->toArray(),
                'ideascaleProfile' => $this->ideascaleProfileFilter->toArray(),
            ],
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
            ]);

        return Inertia::render('Groups/Group', [
            'group' => GroupData::from($group),
            'proposals' => ProposalData::collect($group->proposals()->with(['users', 'fund'])->paginate(5)),
        ]);
    }

    protected function setFilters(Request $request)
    {
        $this->limit = (int) $request->input(QueryParamsEnum::PER_PAGE, 24);
        $this->currentPage = (int) $request->input(QueryParamsEnum::PAGE, 1);
        $this->search = $request->input('s', null);
        $this->search = $request->input(QueryParamsEnum::SEARCH, null);

        $sort = collect(explode(':', $request->input(QueryParamsEnum::SORTS, '')))->filter();
        if ($sort->isEmpty()) {
            $sort = collect(explode(':', collect([
                'name:asc',
                'name:desc',
                'amount_awarded_ada:desc',
                'amount_awarded_ada:asc',
                'amount_awarded_usd:desc',
                'amount_awarded_usd:asc',
            ])->random()));
        }

        $this->sortBy = $sort->first();
        $this->sortOrder = $sort->last();
        $this->fundedProposalsFilter = (bool) $request->input(QueryParamsEnum::FUNDED_PROPOSALS, false);
        $this->awardedUsdFilter = $request->collect(QueryParamsEnum::AWARDED_USD);
        $this->awardedAdaFilter = $request->collect(QueryParamsEnum::AWARDED_ADA);
        $this->fundsFilter = $request->collect(QueryParamsEnum::FUNDS)->map(fn ($n) => intval($n));
        $this->tagsFilter = $request->collect(QueryParamsEnum::TAGS)->map(fn ($n) => intval($n));
        $this->ideascaleProfileFilter = $request->collect(QueryParamsEnum::IDEASCALE_PROFILE)->map(fn ($n) => intval($n));
    }

    public function query($returnBuilder = false, $attrs = null, $filters = [])
    {
        $_options = [
            'filters' => array_merge([], $this->getUserFilters(), $filters),
        ];

        $this->searchBuilder = Group::search(
            $this->search,
            function (Indexes $index, $query, $options) use ($_options, $attrs) {
                if (count($_options['filters']) > 0) {
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
                    'proposals.campaign.fund.title',
                ];

                if ((bool) $this->sortBy && (bool) $this->sortOrder) {
                    $options['sort'] = ["$this->sortBy:$this->sortOrder"];
                }
                $options['offset'] = (($this->currentPage ?? 1) - 1) * $this->limit;
                $options['limit'] = $this->limit;

                return $index->search($query, $options);
            }
        );

        if ($returnBuilder) {
            return $this->searchBuilder;
        }

        $response = new Fluent($this->searchBuilder->raw());

        $this->setCounts($response->facetDistribution, $response->facetStats);

        $pagination = new LengthAwarePaginator(
            $response->hits,
            $response->estimatedTotalHits,
            $response->limit,
            $this->currentPage,
            [
                'pageName' => 'p',
            ]
        );

        return $pagination->onEachSide(1)->toArray();
    }

    #[ArrayShape(['filters' => 'array'])]
    protected function getUserFilters(): array
    {
        $_options = [];

        if ((bool) $this->fundedProposalsFilter) {
            $_options[] = 'proposals_funded > 0';
        }

        if ($this->awardedUsdFilter->isNotEmpty()) {
            $_options[] = "(amount_awarded_usd  {$this->awardedUsdFilter->first()} TO  {$this->awardedUsdFilter->last()})";
        }

        if ($this->awardedAdaFilter->isNotEmpty()) {
            $_options[] = "(amount_awarded_ada  {$this->awardedAdaFilter->first()} TO  {$this->awardedAdaFilter->last()})";
        }

        // filter by fund
        if ($this->fundsFilter->isNotEmpty()) {
            $_options[] = 'proposals.campaign.fund_id IN '.$this->fundsFilter->toJson();
        }

        //  filter by tags
        if ($this->tagsFilter->isNotEmpty()) {
            $_options[] = 'tags.id IN '.$this->tagsFilter->toJson();
        }

        if ($this->ideascaleProfileFilter->isNotEmpty()) {
            $_options[] = 'ideascale_profiles.id IN '.$this->ideascaleProfileFilter->toJson();
        }

        return $_options;
    }

    public function setCounts($facets, $facetStats)
    {

        if (isset($facets['tags.id']) && count($facets['tags.id'])) {
            $this->tagsCount = $facets['tags.id'];
        }

        if (isset($facets['proposals.campaign.fund.title']) && count($facets['proposals.campaign.fund.title'])) {
            $this->fundsCount = $facets['proposals.campaign.fund.title'];
        }
    }
}
