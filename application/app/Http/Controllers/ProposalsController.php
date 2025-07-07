<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\TransformHashToIds;
use App\Actions\TransformIdsToHashes;
use App\DataTransferObjects\FundData;
use App\DataTransferObjects\ProposalData;
use App\DataTransferObjects\ReviewData;
use App\Enums\ProposalFundingStatus;
use App\Enums\ProposalSearchParams;
use App\Enums\ProposalStatus;
use App\Models\Connection;
use App\Models\Fund;
use App\Models\IdeascaleProfile;
use App\Models\Proposal;
use App\Repositories\ProposalRepository;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Fluent;
use Illuminate\Support\Stringable;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Scout\Builder;
use Symfony\Component\HttpFoundation\Request as SymfonyRequest;

class ProposalsController extends Controller
{
    protected int $currentPage = 1;

    protected int $limit = 24;

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

        // dont touch for now
        $proposal = $this->query();

        return Inertia::render(
            'Proposals/Index',
            [
                'proposals' => app()->environment('testing')
                    ? $proposal
                    : Inertia::optional(callback: fn () => $proposal),
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
                    'awardedUSD' => $this->sumApprovedUSD,
                    'awardedADA' => $this->sumApprovedADA,
                    'distributedUSD' => $this->sumDistributedUSD,
                    'distributedADA' => $this->sumDistributedADA,
                ],
            ]
        );
    }

    public function proposal(Request $request, $slug): Response
    {
        $proposal = Proposal::where('slug', $slug)->firstOrFail();
        $this->getProps($request);

        $proposalId = $proposal->id;

        $cacheKey = "proposal:{$proposalId}:base_data";

        $proposalData = Cache::remember($cacheKey, now()->addMinutes(10), function () use ($proposal) {
            $proposal->load(['groups', 'ideascaleProfiles', 'team', 'team.proposals', 'reviews', 'author']);

            $data = $proposal->toArray();

            $data['alignment_score'] = $proposal->getDiscussionRankingScore('Impact Alignment') ?? 0;
            $data['feasibility_score'] = $proposal->getDiscussionRankingScore('Feasibility') ?? 0;
            $data['auditability_score'] = $proposal->getDiscussionRankingScore('Value for money') ?? 0;

            $ideascaleProfileIds = $proposal->ideascaleProfiles ? $proposal->ideascaleProfiles->pluck('id')->toArray() : [];
            $counts = $this->getCounts($ideascaleProfileIds);

            $data['users'] = $proposal->team ? $proposal->team->map(function ($u) {
                $proposals = $u->proposals ? $u->proposals->map(fn ($p) => $p->toArray()) : collect([]);

                return [
                    'id' => $u->id,
                    'hash' => $u->hash,
                    'ideascale_id' => $u->ideascale_id,
                    'username' => $u->username,
                    'name' => $u->name,
                    'bio' => $u->bio,
                    'hero_img_url' => $u->hero_img_url,
                    'proposals_completed' => $proposals->filter(fn ($p) => $p['status'] === 'complete')->count() ?? 0,
                    'first_timer' => ($proposals->map(fn ($p) => isset($p['fund']) ? $p['fund']['id'] : null)->unique()->count() === 1),
                ];
            })->toArray() : [];

            return [
                ...$data,
                'groups' => $proposal->groups ? $proposal->groups->toArray() : [],
                'userCompleteProposalsCount' => $counts['userCompleteProposalsCount'] ?? 0,
                'userOutstandingProposalsCount' => $counts['userOutstandingProposalsCount'] ?? 0,
                'catalystConnectionsCount' => $counts['catalystConnectionCount'] ?? 0,
            ];
        });

        $currentPage = 1;

        $teamConnections = $this->generateTeamNetworkData($proposal);

        $props = [
            'proposal' => ProposalData::from($proposalData),
            'proposals' => Inertia::optional(
                fn () => Cache::remember(
                    "proposal:{$proposalId}:proposals:page:{$currentPage}",
                    now()->addMinutes(10),
                    fn () => to_length_aware_paginator(
                        ProposalData::collect($proposal)
                    )->onEachSide(0)
                )
            ),
            'reviews' => Inertia::optional(
                fn () => Cache::remember(
                    "proposal:{$proposalId}:reviews:page:{$currentPage}",
                    now()->addMinutes(10),
                    fn () => to_length_aware_paginator(
                        ReviewData::collect(
                            $proposal->reviews()
                                ->with(['reviewer.reputation_scores', 'proposal.fund'])
                                ->paginate(11, ['*'], 'p', $currentPage)
                        )
                    )
                )
            ),
            'aggregatedRatings' => Cache::remember(
                "proposal:{$proposalId}:aggregated_ratings",
                now()->addMinutes(10),
                fn () => $proposalData['aggregated_ratings'] ?? []
            ),
            'connections' => $teamConnections,
            'userCompleteProposalsCount' => $proposalData['userCompleteProposalsCount'] ?? 0,
            'userOutstandingProposalsCount' => $proposalData['userOutstandingProposalsCount'] ?? 0,
            'catalystConnectionsCount' => $proposalData['catalystConnectionsCount'] ?? 0,
        ];

        return match (true) {
            str_contains($request->path(), '/details') => Inertia::render('Proposals/Details/Index', $props),
            str_contains($request->path(), '/community-review') => Inertia::render('Proposals/CommunityReview/Index', $props),
            str_contains($request->path(), '/team-information') => Inertia::render('Proposals/TeamInformation/Index', $props),
            default => Inertia::render('Proposals/Details/Index', $props),
        };
    }

    public function myProposals(Request $request): Response
    {
        $userId = Auth::id();
        $ideascaleProfile = IdeascaleProfile::where('claimed_by_id', $userId)->get()->map(fn ($p) => $p->hash);

        if ($ideascaleProfile->isEmpty()) {
            return Inertia::render('My/Proposals/Index', [
                'proposals' => [
                    'data' => [],
                    'filters' => $this->queryParams,
                ],
            ]);
        }

        $request->merge([
            ProposalSearchParams::IDEASCALE_PROFILES()->value => $ideascaleProfile->toArray(),
        ]);

        $this->getProps(request: $request);
        $this->queryParams[ProposalSearchParams::LIMIT()->value] = 12;

        $proposals = null;

        if (! empty($request[ProposalSearchParams::IDEASCALE_PROFILES()->value])) {
            $proposals = $this->query();
        }

        return Inertia::render('My/Proposals/Index', [
            'proposals' => $proposals,
            'filters' => $this->queryParams,
        ]);
    }

    public function charts(Request $request)
    {
        $referer = $request->headers->get('referer');
        $refererParams = [];

        if ($referer) {
            $parsedUrl = parse_url($referer);
            if (isset($parsedUrl['query'])) {
                $refererParams = SymfonyRequest::create('?'.$parsedUrl['query'])->query->all();
            }
        }

        $allParams = array_merge($refererParams, $request->all());
        $mergedRequest = $request->duplicate($allParams);
        $this->getProps($mergedRequest);

        $chartDataByFund = $this->getDetailedCountsByFund();
        $chartDataByYear = $this->getDetailedCountsByYear();

        return Inertia::modal(
            'Charts/Index',
            [
                'slideover' => true,
                'filters' => $this->queryParams,
                'chartDataByFund' => $chartDataByFund ?? [],
                'chartDataByYear' => $chartDataByYear ?? [],
            ]
        )->baseRoute('proposals.index', $refererParams);
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
            ProposalSearchParams::IDEASCALE_PROFILES()->value => 'array|nullable',
            ProposalSearchParams::FUNDS()->value => 'array|nullable',
            ProposalSearchParams::CHART_TYPE()->value => 'string|nullable',
            ProposalSearchParams::SUBMITTED_PROPOSALS()->value => 'array|nullable',
            ProposalSearchParams::APPROVED_PROPOSALS()->value => 'array|nullable',
            ProposalSearchParams::COMPLETED_PROPOSALS()->value => 'array|nullable',
            ProposalSearchParams::UNFUNDED_PROPOSALS()->value => 'array|nullable',
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
            : 24;

        $args['offset'] = ($page - 1) * $limit;
        $args['limit'] = $limit;

        $proposals = app(ProposalRepository::class);

        $builder = $proposals->search(
            $this->queryParams[ProposalSearchParams::QUERY()->value] ?? '',
            $args
        );

        $response = new Fluent($builder->raw());
        $items = collect($response->hits);

        $this->setCounts($response->facetDistribution, $response->facetStats);

        $pagination = new LengthAwarePaginator(
            ProposalData::collect(
                (new TransformIdsToHashes)(
                    collection: $items,
                    model: new Proposal
                )->toArray()
            ),
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
            $filters[] = 'opensource = '.$this->queryParams[ProposalSearchParams::OPENSOURCE_PROPOSALS()->value];
        }

        $filters[] = 'type='.($this->queryParams[ProposalSearchParams::TYPE()->value] ?? 'proposal');

        if (isset($this->queryParams[ProposalSearchParams::QUICK_PITCHES()->value])) {
            $filters[] = 'quickpitch IS NOT NULL';
        }

        // filter by budget range
        if (! empty($this->queryParams[ProposalSearchParams::BUDGETS()->value])) {
            $budgetRange = collect((object) $this->queryParams[ProposalSearchParams::BUDGETS()->value]);
            $filters[] = "(amount_requested  {$budgetRange->first()} TO  {$budgetRange->last()})";
        }

        // filter by challenge
        if (! empty($this->queryParams[ProposalSearchParams::CAMPAIGNS()->value])) {
            $campaignHashes = ($this->queryParams[ProposalSearchParams::CAMPAIGNS()->value]);
            $filters[] = '('.implode(' OR ', array_map(fn ($c) => "campaign.hash = {$c}", $campaignHashes)).')';
        }

        if (! empty($this->queryParams[ProposalSearchParams::TAGS()->value])) {
            $tagHashes = ($this->queryParams[ProposalSearchParams::TAGS()->value]);
            $filters[] = '('.implode(' OR ', array_map(fn ($c) => "tags.hash = {$c}", $tagHashes)).')';
        }

        if (! empty($this->queryParams[ProposalSearchParams::IDEASCALE_PROFILES()->value])) {
            $ideascaleProfileHashes = implode(',', $this->queryParams[ProposalSearchParams::IDEASCALE_PROFILES()->value]);
            $filters[] = "users.hash IN [{$ideascaleProfileHashes}]";
        }

        if (! empty($this->queryParams[ProposalSearchParams::GROUPS()->value])) {
            $groupHashes = implode(',', $this->queryParams[ProposalSearchParams::GROUPS()->value]);
            $filters[] = "groups.hash IN [{$groupHashes}]";
        }

        if (! empty($this->queryParams[ProposalSearchParams::COMMUNITIES()->value])) {
            $communityHashes = implode(',', $this->queryParams[ProposalSearchParams::COMMUNITIES()->value]);
            $filters[] = "communities.hash IN [{$communityHashes}]";
        }

        if (! empty($this->queryParams[ProposalSearchParams::PROJECT_LENGTH()->value])) {
            $projectLength = collect((object) $this->queryParams[ProposalSearchParams::PROJECT_LENGTH()->value]);
            $filters[] = "(project_length  {$projectLength->first()} TO  {$projectLength->last()})";
        }

        if (! empty($this->queryParams[ProposalSearchParams::COHORT()->value])) {
            $cohortFilters = array_map(fn ($cohort) => "{$cohort} = 1", $this->queryParams[ProposalSearchParams::COHORT()->value]);
            $filters[] = '('.implode(' OR ', $cohortFilters).')';
        }

        if (! empty($this->queryParams[ProposalSearchParams::FUNDS()->value])) {
            $idsFromHash = (new TransformHashToIds)(collect($this->queryParams[ProposalSearchParams::FUNDS()->value]), new Fund);
            $funds = implode("','", $idsFromHash);
            $filters[] = "fund.id IN ['{$funds}']";
        }

        return $filters;
    }

    public function setCounts($facets, $facetStats): void
    {

        if (isset($facets['amount_awarded_USD'])) {
            foreach ($facets['amount_awarded_USD'] as $key => $value) {
                $this->sumApprovedUSD += intval($key * $value);
            }
        }

        if (isset($facets['amount_awarded_ADA'])) {
            foreach ($facets['amount_awarded_ADA'] as $key => $value) {
                $this->sumApprovedADA += intval($key * $value);
            }
        }

        if (isset($facets['amount_received_ADA'])) {
            foreach ($facets['amount_received_ADA'] as $key => $value) {
                $this->sumDistributedADA += intval($key * $value);
            }
        }

        if (isset($facets['amount_received_USD'])) {
            foreach ($facets['amount_received_USD'] as $key => $value) {
                $this->sumDistributedUSD += intval($key * $value);
            }
        }

        if (isset($facets['amount_requested_ADA'])) {
            foreach ($facets['amount_requested_ADA'] as $key => $value) {
                $this->sumBudgetsADA += intval($key * $value);
            }
        }

        if (isset($facets['amount_requested_USD'])) {
            foreach ($facets['amount_requested_USD'] as $key => $value) {
                $this->sumBudgetsUSD += intval($key * $value);
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

    public function fundTitles(Request $request)
    {
        $funds = Fund::all(['id', 'title']);

        $fundTitles = $funds->map(function ($fund) {
            return [
                'hash' => $fund->hash,
                'title' => $fund->title,
            ];
        });

        return response()->json($fundTitles);
    }

    public function funds(Request $request)
    {
        $funds = Fund::when($request->search, fn ($q, $search) => $q->where('title', 'ilike', "{$search}%"))->get();

        return FundData::collect($funds);
    }

    public function getCounts($ideascaleProfileIds)
    {
        if (empty($ideascaleProfileIds)) {
            return [
                'userCompleteProposalsCount' => 0,
                'userOutstandingProposalsCount' => 0,
                'catalystConnectionCount' => 0,
            ];
        }

        try {
            $userCompleteProposalsCount = Proposal::where('status', 'complete')
                ->whereHas('ideascaleProfiles', function ($query) use ($ideascaleProfileIds) {
                    $query->whereIn('ideascale_profiles.id', $ideascaleProfileIds);
                })
                ->count();

            $userOutstandingProposalsCount = Proposal::where('status', 'in_progress')
                ->whereHas('ideascaleProfiles', function ($query) use ($ideascaleProfileIds) {
                    $query->whereIn('ideascale_profiles.id', $ideascaleProfileIds);
                })
                ->count();

            $catalystConnectionCount = Connection::whereIn('previous_model_id', $ideascaleProfileIds)
                ->where('previous_model_type', IdeascaleProfile::class)
                ->distinct()
                ->count();

            return [
                'userCompleteProposalsCount' => $userCompleteProposalsCount,
                'userOutstandingProposalsCount' => $userOutstandingProposalsCount,
                'catalystConnectionCount' => $catalystConnectionCount,
            ];
        } catch (\Exception $e) {
            return [
                'userCompleteProposalsCount' => 0,
                'userOutstandingProposalsCount' => 0,
                'catalystConnectionCount' => 0,
            ];
        }
    }

    private function generateTeamNetworkData(Proposal $proposal): array
    {
        $author = $proposal->author;

        if (! $author) {
            $author = $proposal->team->first();
        }

        $teamConnections = [
            'nodes' => [],
            'links' => [],
            'rootNodeId' => $author ? $author->id : null,
            'rootNodeHash' => $author ? $author->hash : null,
            'rootNodeType' => $author ? get_class($author) : null,
        ];

        if (! $author) {
            return $teamConnections;
        }

        $teamConnections['nodes'][] = [
            'id' => $author->id,
            'type' => get_class($author),
            'name' => $author->name ?? $author->username ?? 'Author',
            'photo' => $author->hero_img_url ?? null,
            'hash' => $author->hash,
        ];

        foreach ($proposal->team as $member) {
            if ($member->id == $author->id) {
                continue;
            }

            $teamConnections['nodes'][] = [
                'id' => $member->id,
                'type' => get_class($member),
                'name' => $member->name ?? $member->username ?? 'Team Member',
                'photo' => $member->hero_img_url ?? null,
                'hash' => $member->hash,
            ];

            $teamConnections['links'][] = [
                'source' => $author->id,
                'target' => $member->id,
            ];

            foreach ($proposal->team as $otherMember) {
                if ($member->id != $otherMember->id && $otherMember->id != $author->id) {
                    $teamConnections['links'][] = [
                        'source' => $member->id,
                        'target' => $otherMember->id,
                    ];
                }
            }
        }

        $teamConnections['links'] = array_values(array_unique(array_map(function ($link) {
            return json_encode($link);
        }, $teamConnections['links']), SORT_REGULAR));

        $teamConnections['links'] = array_map(function ($link) {
            return json_decode($link, true);
        }, $teamConnections['links']);

        return $teamConnections;
    }

    public function getDetailedCountsByFund()
    {
        $args = [
            'filter' => $this->getUserFilters(),
            'limit' => 0,
        ];

        $proposals = app(ProposalRepository::class);

        $searchQuery = $this->queryParams[ProposalSearchParams::QUERY()->value] ?? '';

        $builder = $proposals->search($searchQuery, $args);
        $response = new Fluent($builder->raw());

        $funds = $response->facetDistribution['fund.title'] ?? [];

        uksort($funds, function ($a, $b) {
            $numA = (int) str_replace('Fund ', '', $a);
            $numB = (int) str_replace('Fund ', '', $b);

            return $numA - $numB;
        });

        $chartData = [];

        foreach (array_keys($funds) as $fundTitle) {
            $fundedCount = $this->getFundedCountByFund($fundTitle);
            $completedCount = $this->getCompletedCountByFund($fundTitle);
            $unfundedCount = $this->getUnfundedCountByFund($fundTitle);

            if (! empty($this->queryParams[ProposalSearchParams::SUBMITTED_PROPOSALS()->value])) {
                $chartData[] = $funds;
            } else {
                $chartData[] = [
                    'fund' => $fundTitle,
                    'unfundedProposals' => $unfundedCount ?? 0,
                    'fundedProposals' => $fundedCount ?? 0,
                    'completedProposals' => $completedCount ?? 0,
                ];
            }
        }

        return $chartData;
    }

    public function getDetailedCountsByYear()
    {
        $args = [
            'filter' => $this->getUserFilters(),
            'limit' => 0,
        ];

        $proposals = app(ProposalRepository::class);

        $searchQuery = $this->queryParams[ProposalSearchParams::QUERY()->value] ?? '';

        $builder = $proposals->search($searchQuery, $args);
        $response = new Fluent($builder->raw());

        $createdDates = $response->facetDistribution['created_at'] ?? [];
        $yearCounts = [];

        foreach ($createdDates as $date => $count) {
            $year = date('Y', strtotime($date));

            if (! isset($yearCounts[$year])) {
                $yearCounts[$year] = 0;
            }

            $yearCounts[$year] += $count;
        }

        ksort($yearCounts);

        $chartData = [];

        foreach (array_keys($yearCounts) as $year) {
            $fundedCount = $this->getFundedCountByYear($year);
            $completedCount = $this->getCompletedCountByYear($year);
            $unfundedCount = $this->getUnfundedCountByYear($year);

            if (! empty($this->queryParams[ProposalSearchParams::SUBMITTED_PROPOSALS()->value])) {
                $chartData[] = $yearCounts;
            } else {
                $chartData[] = [
                    'year' => $year,
                    'unfundedProposals' => $unfundedCount ?? 0,
                    'fundedProposals' => $fundedCount ?? 0,
                    'completedProposals' => $completedCount ?? 0,
                ];
            }
        }

        return $chartData;
    }

    private function getFundedCountByFund($fundTitle): int
    {
        $fundedFilters = array_merge($this->getUserFilters(), [
            'fund.title = "'.$fundTitle.'"',
            '(funding_status = "'.ProposalFundingStatus::funded()->value.'" OR funding_status = "'.ProposalFundingStatus::leftover()->value.'")',
        ]);

        $proposals = app(ProposalRepository::class);
        $args = [
            'filter' => $fundedFilters,
            'limit' => 0,
            'facets' => ['fund.title'],
        ];

        $response = new Fluent($proposals->search(
            $this->queryParams[ProposalSearchParams::QUERY()->value] ?? '',
            $args
        )->raw());

        $fundedCount = $response->facetDistribution['fund.title'][$fundTitle] ?? 0;

        if (empty($this->queryParams[ProposalSearchParams::APPROVED_PROPOSALS()->value])) {
            return 0;
        } else {
            return $fundedCount;
        }
    }

    private function getCompletedCountByFund($fundTitle): int
    {
        $completedFilters = array_merge($this->getUserFilters(), [
            'fund.title = "'.$fundTitle.'"',
            'status = "'.ProposalStatus::complete()->value.'"',
        ]);

        $proposals = app(ProposalRepository::class);
        $args = [
            'filter' => $completedFilters,
            'limit' => 0,
            'facets' => ['fund.title'],
        ];

        $response = new Fluent($proposals->search(
            $this->queryParams[ProposalSearchParams::QUERY()->value] ?? '',
            $args
        )->raw());

        $completedCount = $response->facetDistribution['fund.title'][$fundTitle] ?? 0;

        if (empty($this->queryParams[ProposalSearchParams::COMPLETED_PROPOSALS()->value])) {
            return 0;
        } else {
            return $completedCount;
        }
    }

    private function getUnfundedCountByFund($fundTitle): int
    {
        $unfundedFilters = array_merge($this->getUserFilters(), [
            'fund.title = "'.$fundTitle.'"',
            'status = "'.ProposalStatus::unfunded()->value.'"',
        ]);

        $proposals = app(ProposalRepository::class);
        $args = [
            'filter' => $unfundedFilters,
            'limit' => 0,
            'facets' => ['fund.title'],
        ];

        $response = new Fluent($proposals->search(
            $this->queryParams[ProposalSearchParams::QUERY()->value] ?? '',
            $args
        )->raw());

        $unfundedCount = $response->facetDistribution['fund.title'][$fundTitle] ?? 0;

        if (empty($this->queryParams[ProposalSearchParams::UNFUNDED_PROPOSALS()->value])) {
            return 0;
        } else {
            return $unfundedCount;
        }
    }

    private function getFundedCountByYear(int $year): int
    {
        $fundedStatusFilter = 'funding_status = "'.ProposalFundingStatus::funded()->value.'"';
        $leftoverStatusFilter = 'funding_status = "'.ProposalFundingStatus::leftover()->value.'"';

        $fundingStatusFilter = "({$fundedStatusFilter} OR {$leftoverStatusFilter})";

        $startTimestamp = Carbon::create($year, 1, 1)->timestamp;
        $endTimestamp = Carbon::create($year + 1, 1, 1)->timestamp;

        $yearFilter = "created_at_timestamp >= {$startTimestamp} AND created_at_timestamp < {$endTimestamp}";

        $filters = array_merge($this->getUserFilters(), [$fundingStatusFilter, $yearFilter]);

        $proposals = app(ProposalRepository::class);
        $args = [
            'filter' => $filters,
            'limit' => 0,
            'facets' => ['funding_status'],
        ];

        $response = new Fluent($proposals->search(
            $this->queryParams[ProposalSearchParams::QUERY()->value] ?? '',
            $args
        )->raw());

        $fundedCount = $response->facetDistribution['funding_status'][ProposalFundingStatus::funded()->value] ?? 0;
        $leftoverCount = $response->facetDistribution['funding_status'][ProposalFundingStatus::leftover()->value] ?? 0;

        $totalFundedCount = $fundedCount + $leftoverCount;

        if (empty($this->queryParams[ProposalSearchParams::APPROVED_PROPOSALS()->value])) {
            return 0;
        }

        return $totalFundedCount;
    }

    private function getCompletedCountByYear(int $year): int
    {
        $completedStatusFilter = 'status = "'.ProposalStatus::complete()->value.'"';
        $startTimestamp = Carbon::create($year, 1, 1)->timestamp;
        $endTimestamp = Carbon::create($year + 1, 1, 1)->timestamp;

        $yearFilter = "created_at_timestamp >= {$startTimestamp} AND created_at_timestamp < {$endTimestamp}";

        $filters = array_merge($this->getUserFilters(), [$completedStatusFilter, $yearFilter]);

        $proposals = app(ProposalRepository::class);
        $args = [
            'filter' => $filters,
            'limit' => 0,
            'facets' => ['status'],
        ];

        $response = new Fluent($proposals->search(
            $this->queryParams[ProposalSearchParams::QUERY()->value] ?? '',
            $args
        )->raw());

        $completedCount = $response->facetDistribution['status'][ProposalStatus::complete()->value] ?? 0;

        if (empty($this->queryParams[ProposalSearchParams::COMPLETED_PROPOSALS()->value])) {
            return 0;
        }

        return $completedCount;
    }

    private function getUnfundedCountByYear(int $year): int
    {
        $unfundedStatusFilter = 'status = "'.ProposalStatus::unfunded()->value.'"';
        $startTimestamp = Carbon::create($year, 1, 1)->timestamp;
        $endTimestamp = Carbon::create($year + 1, 1, 1)->timestamp;

        $yearFilter = "created_at_timestamp >= {$startTimestamp} AND created_at_timestamp < {$endTimestamp}";

        $filters = array_merge($this->getUserFilters(), [$unfundedStatusFilter, $yearFilter]);

        $proposals = app(ProposalRepository::class);
        $args = [
            'filter' => $filters,
            'limit' => 0,
            'facets' => ['status'],
        ];

        $response = new Fluent($proposals->search(
            $this->queryParams[ProposalSearchParams::QUERY()->value] ?? '',
            $args
        )->raw());

        $unfundedCount = $response->facetDistribution['status'][ProposalStatus::unfunded()->value] ?? 0;

        if (empty($this->queryParams[ProposalSearchParams::COMPLETED_PROPOSALS()->value])) {
            return 0;
        }

        return $unfundedCount;
    }
}
