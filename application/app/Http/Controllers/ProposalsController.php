<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;
use App\Models\Proposal;
use Laravel\Scout\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Fluent;
use Illuminate\Support\Collection;
use Illuminate\Support\Stringable;
use App\Enums\ProposalSearchParams;
use App\Repositories\ProposalRepository;
use App\DataTransferObjects\ProposalData;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Pagination\LengthAwarePaginator;

class ProposalsController extends Controller
{
    protected int $currentPage = 1;

    protected int $limit = 36;

    protected array $queryParams = [];

    protected ?string $sortBy = 'created_at';

    protected ?string $sortOrder = 'desc';

    protected null|string|Stringable $search = null;

    public array $tagsCount = [];

    public array $fundsCount = [];

    public array $cohortData = [];

    public array $challengesCount = [];

    public int $submittedProposals = 0;

    public int $approvedProposals = 0;

    public int $completedProposals = 0;

    public int $sumBudgetsADA = 0;

    public int $sumBudgetsUSD = 0;

    public int $sumApprovedADA = 0;

    public int $sumApprovedUSD = 0;

    public int $sumDistributedADA = 0;

    public int $sumDistributedUSD = 0;

    public int $sumCompletedUSD = 0;

    /**
     * Display the user's profile form.
     */
    public function index(Request $request): Response
    {
        $this->getProps($request);

        $proposals = empty($this->queryParams) ? $this->getRandomProposals() : $this->query();

        return Inertia::render('Proposals/Index', [
            'proposals' => $proposals,
            'filters' => $this->queryParams,
            'funds' => $this->fundsCount,
            'search' => $this->search,
            'sort' => "{$this->sortBy}:{$this->sortOrder}",
            'metrics' => [
                'submitted' => $this->submittedProposals,
                'approved' => $this->approvedProposals,
                'completed' => $this->completedProposals,
                'requestedUSD' => $this->sumBudgetsUSD,
                'requestedADA' => $this->sumBudgetsADA,
                'awardedUSD' => $this->sumDistributedUSD,
                'awardedADA' => $this->sumDistributedADA,
            ]
        ]);
    }

    protected function getProps(Request $request): void
    {


        $this->queryParams = $request->validate([
            ProposalSearchParams::FUNDING_STATUS()->value => 'array|nullable',
            ProposalSearchParams::OPENSOURCE_PROPOSALS()->value => 'bool|nullable',
            ProposalSearchParams::PROJECT_LENGTH()->value => 'array|nullable',
            ProposalSearchParams::PROJECT_STATUS()->value => 'array|nullable',
            ProposalSearchParams::QUERY()->value => 'string|nullable',
            ProposalSearchParams::COHORT()->value => 'array|nullable',
            ProposalSearchParams::QUICK_PITCHES()->value => 'bool|nullable',
            ProposalSearchParams::TYPE()->value => 'string|nullable',
            ProposalSearchParams::PAGE()->value => 'int|nullable',
            ProposalSearchParams::LIMIT()->value => 'int|nullable',
            ProposalSearchParams::SORTS()->value => 'nullable',
            ProposalSearchParams::BUDGETS()->value => 'array|nullable',
            ProposalSearchParams::MIN_BUDGET()->value => 'int|nullable',
            ProposalSearchParams::MAX_BUDGET()->value => 'int|nullable',
            ProposalSearchParams::MIN_PROJECT_LENGTH()->value => 'int|nullable',
            ProposalSearchParams::MAX_PROJECT_LENGTH()->value => 'int|nullable',
            ProposalSearchParams::CAMPAIGNS()->value => 'array|nullable',
            ProposalSearchParams::TAGS()->value => 'array|nullable',
            ProposalSearchParams::GROUPS()->value => 'array|nullable',
            ProposalSearchParams::COMMUNITIES()->value => 'array|nullable',
            ProposalSearchParams::PEOPLE()->value => 'array|nullable',
            ProposalSearchParams::FUNDS()->value => 'array|nullable',
        ]);

        // formart sort params for meili
        if (!empty($this->queryParams[ProposalSearchParams::SORTS()->value])) {

            $sort = collect(
                explode(
                    ':',
                    $this->queryParams[ProposalSearchParams::SORTS()->value]
                )
            )->filter();

            $this->sortBy = $sort->first();

            $this->sortOrder = $sort->last();
        }


        // set defaults max and mins
        $this->queryParams[ProposalSearchParams::MAX_BUDGET()->value] =  10000000;
        $this->queryParams[ProposalSearchParams::MIN_BUDGET()->value] =  1;
        $this->queryParams[ProposalSearchParams::MAX_PROJECT_LENGTH()->value] =  12;
        $this->queryParams[ProposalSearchParams::MIN_PROJECT_LENGTH()->value] =  0;

        if (empty($this->queryParams[ProposalSearchParams::BUDGETS()->value])) {
            $this->queryParams[ProposalSearchParams::BUDGETS()->value] = [1, 10000000];
        }

        if (empty($this->queryParams[ProposalSearchParams::PROJECT_LENGTH()->value])) {
            $this->queryParams[ProposalSearchParams::PROJECT_LENGTH()->value] = [0, 12];
        }
    }

    protected function query($returnBuilder = false, $attrs = null, $filters = []): array|Builder
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

        $proposals = app(ProposalRepository::class);

        $builder = $proposals->search(
            $this->queryParams[ProposalSearchParams::QUERY()->value] ?? '',
            $args
        );

        $response = new Fluent($builder->raw());

        $this->setCounts($response->facetDistribution, $response->facetStats);

        $pagination = new LengthAwarePaginator(
            ProposalData::collect($response->hits),
            $response->estimatedTotalHits,
            $limit,
            $page,
            [
                'pageName' => 'p',
            ]
        );
        return $pagination->onEachSide(1)->toArray();
    }

    protected function getRandomProposals(): Paginator|array|Collection
    {
        $proposals = app(ProposalRepository::class);
        $pagination = new LengthAwarePaginator(
            ProposalData::collect(
                $proposals->getQuery()->inRandomOrder()->limit($this->limit)->get()
            ),
            Proposal::count(),
            $this->limit,
            $this->currentPage,
            [
                'pageName' => 'p',
            ]
        );

        return $pagination->onEachSide(1)->toArray();
    }

    protected function getUserFilters(): array
    {
        $filters = [];

        if (isset($this->queryParams[ProposalSearchParams::FUNDING_STATUS()->value])) {
            $fundingStatuses = implode(',', $this->queryParams[ProposalSearchParams::FUNDING_STATUS()->value]);
            $filters[] = "funding_status IN [{$fundingStatuses}]";
        }

        if (isset($this->queryParams[ProposalSearchParams::PROJECT_STATUS()->value])) {
            $projectStatuses = implode(',', $this->queryParams[ProposalSearchParams::PROJECT_STATUS()->value]);
            $filters[] = "status IN [{$projectStatuses}]";
        }

        if (isset($this->queryParams[ProposalSearchParams::OPENSOURCE_PROPOSALS()->value])) {
            $filters[] = 'opensource = ' . $this->queryParams[ProposalSearchParams::OPENSOURCE_PROPOSALS()->value];
        }

        if (isset($this->queryParams[ProposalSearchParams::TYPE()->value])) {
            $filters[] = 'type = ' . $this->queryParams[ProposalSearchParams::TYPE()->value];
        }

        if (isset($this->queryParams[ProposalSearchParams::QUICK_PITCHES()->value])) {
            $filters[] = 'quickpitch IS NOT NULL';
        }

        // filter by budget range
        if (!empty($this->queryParams[ProposalSearchParams::BUDGETS()->value])) {
            $budgetRange = collect((object) $this->queryParams[ProposalSearchParams::BUDGETS()->value]);
            $filters[] = "(amount_requested  {$budgetRange->first()} TO  {$budgetRange->last()})";
        }

        // filter by challenge
        if (!empty($this->queryParams[ProposalSearchParams::CAMPAIGNS()->value])) {
            $campaignIds = ($this->queryParams[ProposalSearchParams::CAMPAIGNS()->value]);
            $filters[] = '(' . implode(' OR ', array_map(fn($c) => "campaign.id = {$c}", $campaignIds)) . ')';
        }

        if (!empty($this->queryParams[ProposalSearchParams::TAGS()->value])) {
            $tagIds = ($this->queryParams[ProposalSearchParams::TAGS()->value]);
            $filters[] = '(' . implode(' OR ', array_map(fn($c) => "tags.id = {$c}", $tagIds)) . ')';
        }

        if (!empty($this->queryParams[ProposalSearchParams::PEOPLE()->value])) {
            $peopleIds = implode(',', $this->queryParams[ProposalSearchParams::PEOPLE()->value]);
            $filters[] = "users.id IN [{$peopleIds}]";
        }

        if (!empty($this->queryParams[ProposalSearchParams::GROUPS()->value])) {
            $groupIds = implode(',', $this->queryParams[ProposalSearchParams::GROUPS()->value]);
            $filters[] = "groups.id IN [{$groupIds}]";
        }

        if (!empty($this->queryParams[ProposalSearchParams::COMMUNITIES()->value])) {
            $communityIds = implode(',', $this->queryParams[ProposalSearchParams::COMMUNITIES()->value]);
            $filters[] = "communities.id IN [{$communityIds}]";
        }

        if (!empty($this->queryParams[ProposalSearchParams::PROJECT_LENGTH()->value])) {
            $projectLength = collect((object) $this->queryParams[ProposalSearchParams::PROJECT_LENGTH()->value]);
            $filters[] = "(project_length  {$projectLength->first()} TO  {$projectLength->last()})";
        }

        if (!empty($this->queryParams[ProposalSearchParams::COHORT()->value])) {
            $cohortFilters = array_map(fn($cohort) => "{$cohort} = 1", $this->queryParams[ProposalSearchParams::COHORT()->value]);

            $filters[] = '(' . implode(' OR ', $cohortFilters) . ')';
        }

        if (!empty($this->queryParams[ProposalSearchParams::FUNDS()->value])) {
            $funds = array_map(fn($fund) => "fund.title = '{$fund}'", $this->queryParams[ProposalSearchParams::FUNDS()->value]);
            $filters[] = '(' . implode(' OR ', $funds) . ')';
        }


        //
        //        if ($this->fundingStatus === 'paid') {
        //            $filters[] = '(paid = 1)';
        //        }
        //
        //        if (count($this->proposalsFilter)) {
        //            $filters[] = 'id IN'.$this->proposalsFilter->toJson();
        //        }
        //        // filter by fund
        //        if ($this->fundsFilter->isNotEmpty()) {
        //            $filters[] = '('.$this->fundsFilter->map(fn ($f) => "fund.id = {$f}")->implode(' OR ').')';
        //        }
        //
        //
        //        if ($this->categoriesFilter->isNotEmpty()) {
        //            $filters[] = 'categories.id IN '.$this->categoriesFilter->toJson();
        //        }
        //

        //
        //

        return $filters;
    }

    public function setCounts($facets, $facetStats): void
    {
        
        if (isset($facets['amount_awarded_USD'])) {
            foreach ($facets['amount_awarded_USD'] as $key => $value) {
                $this->sumApprovedUSD += $key * $value;
            }
        }

        if (isset($facets['amount_awarded_ADA'])) {
            foreach ($facets['amount_awarded_ADA'] as $key => $value) {
                $this->sumApprovedADA += $key * $value;
            }
        }

        if (isset($facets['amount_received_ADA'])) {
            foreach ($facets['amount_received_ADA'] as $key => $value) {
                $this->sumDistributedADA += $key * $value;
            }
        }

        if (isset($facets['amount_received_USD'])) {
            foreach ($facets['amount_received_USD'] as $key => $value) {
                $this->sumDistributedUSD += $key * $value;
            }
        }

        if (isset($facets['amount_requested_ADA'])) {
            foreach ($facets['amount_requested_ADA'] as $key => $value) {
                $this->sumBudgetsADA += $key * $value;
            }
        }

        if (isset($facets['amount_requested_USD'])) {
            foreach ($facets['amount_requested_USD'] as $key => $value) {
                $this->sumBudgetsUSD += $key * $value;
            }
        }

        if (isset($facets['status']['complete'])) {
            $this->completedProposals = $facets['status']['complete'];
        }

        if (isset($facets['status'])) {
            foreach ($facets['status'] as $key => $value) {
                $this->submittedProposals += $value;
            }
        }

        if (isset($facets['funding_status']['funded'])) {
            $this->approvedProposals = $facets['funding_status']['funded'];
        }

        if (isset($facets['funding_status']['leftover'])) {
            $this->approvedProposals = $this->approvedProposals + $facets['funding_status']['leftover'];
        }

        if (isset($facets['campaign.title']) && count($facets['campaign.title'])) {
            $this->challengesCount = $facets['campaign.title'];
        }

        if (isset($facets['tags.id']) && count($facets['tags.id'])) {
            $this->tagsCount = $facets['tags.id'];
        }

        if (isset($facets['fund.title']) && count($facets['fund.title'])) {
            $this->fundsCount = $facets['fund.title'];
        }
        // if (isset($facetStats['amount_requested'])) {
        //     $this->budgets = collect(array_values($facetStats['amount_requested']));
        // }

        // if (isset($facetStats['project_length'])) {
        //     $this->queryParams[ProposalSearchParams::PROJECT_LENGTH()->value] = collect(array_values($facetStats['project_length']));
        // }

        // if (isset($facetStats['amount_requested'])) {
        //     $this->queryParams[ProposalSearchParams::MAX_BUDGET()->value] = $facetStats['amount_requested']['max'];
        //     $this->queryParams[ProposalSearchParams::MIN_BUDGET()->value] = $facetStats['amount_requested']['min'];
        //     $this->queryParams[ProposalSearchParams::BUDGETS()->value] = [$facetStats['amount_requested']['min'], $facetStats['amount_requested']['max']];
        // }

        if (isset($facets['woman_proposal'])) {
            $this->cohortData['woman_proposal'] = $facets['woman_proposal'];
        }

        if (isset($facets['opensource'])) {
            $this->cohortData['opensource'] = $facets['opensource'];
        }

        if (isset($facets['ideafest_proposal'])) {
            $this->cohortData['ideafest_proposal'] = $facets['ideafest_proposal'];
        }

        if (isset($facets['has_quick_pitch'])) {
            $this->cohortData['has_quick_pitch'] = $facets['has_quick_pitch'];
        }

        if (isset($facets['impact_proposal'])) {
            $this->cohortData['impact_proposal'] = $facets['impact_proposal'];
        }
    }
}
