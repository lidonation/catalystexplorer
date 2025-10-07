<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\WeightedRandomizeQuickPitches;
use App\DataTransferObjects\CampaignData;
use App\DataTransferObjects\CatalystTallyData;
use App\DataTransferObjects\FundData;
use App\DataTransferObjects\MetricData;
use App\DataTransferObjects\ProposalData;
use App\Enums\CampaignsSortBy;
use App\Enums\CatalystCurrencies;
use App\Enums\ProposalFundingStatus;
use App\Enums\ProposalSearchParams;
use App\Enums\ProposalStatus;
use App\Models\Campaign;
use App\Models\CatalystProfile;
use App\Models\CatalystTally;
use App\Models\Connection;
use App\Models\Fund;
use App\Models\IdeascaleProfile;
use App\Models\Proposal;
use App\Repositories\FundRepository;
use App\Repositories\MetricRepository;
use App\Repositories\ProposalRepository;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FundsController extends Controller
{
    protected array $queryParams = [];

    public function index(Request $request, FundRepository $fundRepository): Response
    {
        $funds = FundData::collect($fundRepository->getQuery()
            ->withCount([
                'proposals',
                'funded_proposals',
                'completed_proposals',
                'unfunded_proposals',
            ])->get());

        $totalProposals = $funds->sum('proposals_count');
        $fundedProposals = $funds->sum('funded_proposals_count');
        $totalFundsAwardedADA = $funds->where('currency', CatalystCurrencies::ADA()->value)->sum('amount_awarded');
        $totalFundsAwardedUSD = $funds->where('currency', CatalystCurrencies::USD()->value)->sum('amount_awarded');
        $proposalsCountByYear = $this->getProposalsCountByYear();

        return Inertia::render('Funds/Index', [
            'funds' => $funds,
            'proposalsCountByYear' => $proposalsCountByYear,
            'chartSummary' => [
                'totalProposals' => $totalProposals,
                'fundedProposals' => $fundedProposals,
                'totalFundsAwardedAda' => $totalFundsAwardedADA,
                'totalFundsAwardedUsd' => $totalFundsAwardedUSD,
            ],
        ]);
    }

    public function fund(Request $request, Fund $fund, MetricRepository $metrics): Response
    {
        $fund->append(['banner_img_url']);
        $this->getProps($request);

        $campaigns = $this->getCampaigns($fund);
        $campaigns->append([
            'total_requested',
            'total_awarded',
            'total_distributed',
        ]);

        return Inertia::render('Funds/Fund', [
            'fund' => $fund,
            'filters' => $this->queryParams,
            'metrics' => Inertia::optional(
                fn () => MetricData::collect(
                    $metrics
                        ->limit(6)
                        ->getQuery()
                        ->where('context', 'fund')
                        ->get()
                        ->map(function ($metric) use ($fund) {
                            $chartData = $metric->chartData;

                            if (! isset($chartData['data'])) {
                                return $metric;
                            }

                            $currentFundData = collect($chartData['data'])->firstWhere('x', $fund->title);

                            if (empty($chartData['data'])) {
                                return null;
                            }

                            $filteredData = collect($chartData['data'])
                                ->reject(fn ($item) => $item['x'] === $fund->title || empty($item['y']))
                                ->values();

                            if ($currentFundData && ! empty($currentFundData['y'])) {
                                $filteredData->push($currentFundData);
                            }

                            if ($filteredData->isEmpty()) {
                                return null;
                            }

                            return (object) array_merge((array) $metric, [
                                'chartData' => [
                                    'id' => $chartData['id'],
                                    'color' => $chartData['color'],
                                    'data' => $filteredData->values()->toArray(),
                                ],
                                'title' => $metric->title,
                                'type' => $metric->type,
                                'query' => $metric->query,
                                'color' => $metric->color,
                                'content' => $metric->content,
                                'hash' => $metric->hash,
                                'user_id' => $metric->user_id,
                                'status' => $metric->status,
                                'created_at' => $metric->created_at ?? now(),
                                'updated_at' => $metric->updated_at ?? now(),
                                'field' => $metric->field,
                                'count_by' => $metric->count_by,
                                'value' => collect($chartData['data'] ?? [])
                                    ->firstWhere('x', $fund->title)['y'] ?? $metric->metric_value,
                                'order' => $metric->order,
                            ]);
                        })
                        ->filter()
                )
            ),
            'campaigns' => Inertia::optional(fn () => CampaignData::collect($campaigns)),
        ]);
    }

    public function activeFund(Request $request, ProposalRepository $proposals)
    {
        $activeFund = Fund::latest('launched_at')
            ->withCount(['funded_proposals', 'completed_proposals', 'unfunded_proposals', 'proposals'])
            ->first();

        $activeFund->append(['banner_img_url']);
        $this->getProps($request);

        $amountAwarded = $activeFund->funded_proposals()->sum('amount_requested');
        $amountDistributed = $activeFund->funded_proposals()->sum('amount_received');
        $amountRemaining = $amountAwarded - $amountDistributed;

        $campaigns = $this->getCampaigns($activeFund);
        $campaigns->append([
            'total_requested',
            'total_awarded',
            'total_distributed',
        ]);

        $page = (int) $request->get('p', 1);
        $perPage = (int) $request->get('per_page', 24);

        $allFunds = Fund::orderBy('launched_at', 'desc')
            ->get(['id', 'title', 'amount']);

        return Inertia::render('ActiveFund/Index', [
            'proposals' => Inertia::optional(
                fn () => $this->getProposals($activeFund, $proposals)
            ),
            'fund' => FundData::from($activeFund),
            'campaigns' => $campaigns,
            'funds' => $allFunds,
            'amountDistributed' => $amountDistributed,
            'amountRemaining' => $amountRemaining,
            'tallies' => $this->getTallies($activeFund, $perPage, $page),
            'filters' => $this->queryParams,
            'quickPitches' => Inertia::optional(
                fn () => $this->getActiveFundQuickPitches($activeFund, $proposals)
            ),
        ]);
    }

    public function allChartsLiveTally(Request $request): Response
    {
        $this->getProps($request);

        [$selectedFund, $allFunds] = $this->resolveSelectedFund($request);

        $selectedFund->append(['banner_img_url']);

        $campaigns = $this->getCampaigns($selectedFund);
        $campaigns->append([
            'total_requested',
            'total_awarded',
            'total_distributed',
        ]);

        $page = (int) ($request->get(ProposalSearchParams::PAGE()->value) ?? 1);
        $perPage = (int) ($request->get(ProposalSearchParams::PER_PAGE()->value) ?? 24);

        return Inertia::render('Charts/AllCharts/LiveTally/index', [
            'fund' => FundData::from($selectedFund),
            'funds' => $allFunds,
            'campaigns' => Inertia::optional(fn () => CampaignData::collect($campaigns)),
            'tallies' => $this->getTallies($selectedFund, $perPage, $page),
            'filters' => $this->queryParams,
        ]);
    }

    public function allChartsRegistrations(Request $request): Response
    {
        $this->getProps($request);

        [$selectedFund, $allFunds] = $this->resolveSelectedFund($request);

        return Inertia::render('Charts/AllCharts/Registrations/index', [
            'fund' => FundData::from($selectedFund),
            'funds' => $allFunds,
            'filters' => $this->queryParams,
        ]);
    }

    public function allChartsConfirmedVoters(Request $request): Response
    {
        $this->getProps($request);

        [$selectedFund, $allFunds] = $this->resolveSelectedFund($request);

        return Inertia::render('Charts/AllCharts/ConfirmedVoters/index', [
            'fund' => FundData::from($selectedFund),
            'funds' => $allFunds,
            'filters' => $this->queryParams,
        ]);
    }

    public function allChartsLeaderboards(Request $request): Response
    {
        $this->getProps($request);

        [$selectedFund, $allFunds] = $this->resolveSelectedFund($request);

        return Inertia::render('Charts/AllCharts/Leaderboards/index', [
            'fund' => FundData::from($selectedFund),
            'funds' => $allFunds,
            'filters' => $this->queryParams,
        ]);
    }

    /**
     * @return array{0: Fund, 1: \Illuminate\Support\Collection}
     */
    protected function resolveSelectedFund(Request $request): array
    {
        $fundsQuery = Fund::withCount(['funded_proposals', 'completed_proposals', 'unfunded_proposals', 'proposals'])
            ->orderBy('launched_at', 'desc');

        $fundIdParam = $request->input(ProposalSearchParams::FUNDS()->value);
        $fundId = null;

        if (is_array($fundIdParam) && count($fundIdParam) > 0) {
            $fundId = (int) $fundIdParam[0];
        } elseif ($fundIdParam !== null) {
            $fundId = (int) $fundIdParam;
        }

        if ($fundId) {
            $selectedFund = (clone $fundsQuery)->find($fundId);
        } else {
            $selectedFund = (clone $fundsQuery)->first();
        }

        if (! $selectedFund) {
            $selectedFund = (clone $fundsQuery)->firstOrFail();
        }

        $allFunds = Fund::orderBy('launched_at', 'desc')
            ->get(['id', 'title', 'amount']);

        return [$selectedFund, $allFunds];
    }

    public function campaign(Request $request, Campaign $campaign): Response
    {
        $fund = Fund::latest('launched_at')->first();

        $campaign->loadCount([
            'completed_proposals',
            'unfunded_proposals',
            'funded_proposals',
            'proposals',
        ]);

        $campaign->append([
            'total_requested',
            'total_awarded',
            'total_distributed',
        ]);

        $fund->append(['banner_img_url', 'hero_img_url']);

        $this->getProps($request);

        $amountAwarded = $fund->funded_proposals()->sum('amount_requested') ?? 0;
        $amountDistributed = $fund->funded_proposals()->sum('amount_received') ?? 0;
        $amountRemaining = $amountAwarded - $amountDistributed;

        $props = [
            'fund' => FundData::from($fund),
            'campaign' => $campaign,
            'filters' => $this->queryParams,
            'amountDistributed' => $amountDistributed,
            'amountRemaining' => $amountRemaining,
        ];

        $proposalsData = $this->getCampaignProposalsWithPagination($request, $campaign);
        $props = array_merge($props, $proposalsData);

        $hasPageParam = $request->has('p') && $request->get('p') > 1;
        $props['initialTab'] = (str_contains($request->path(), '/proposals') || $hasPageParam) ? 'proposals' : 'overview';

        return Inertia::render('ActiveFund/Campaign', $props);
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
            ProposalSearchParams::CATALYST_PROFILES()->value => 'array|nullable',
            ProposalSearchParams::IDEASCALE_PROFILES()->value => 'array|nullable',
            ProposalSearchParams::FUNDS()->value => 'array|nullable',
            ProposalSearchParams::CHART_TYPE()->value => 'string|nullable',
            ProposalSearchParams::SUBMITTED_PROPOSALS()->value => 'array|nullable',
            ProposalSearchParams::APPROVED_PROPOSALS()->value => 'array|nullable',
            ProposalSearchParams::COMPLETED_PROPOSALS()->value => 'array|nullable',
            ProposalSearchParams::UNFUNDED_PROPOSALS()->value => 'array|nullable',
            ProposalSearchParams::IN_PROGRESS_PROPOSALS()->value => 'array|nullable',
        ]);
    }

    public function getCampaigns(Fund $fund)
    {
        $sortParam = $this->queryParams[ProposalSearchParams::SORTS()->value] ?? null;
        $sortField = null;
        $sortDirection = null;

        if ($sortParam) {
            [$sortField, $sortDirection] = explode(':', $sortParam);
        }

        $query = $fund->campaigns()
            //            ->with(['proposals', 'funded_proposals'])
            ->withCount([
                'completed_proposals',
                'unfunded_proposals',
                'funded_proposals',
            ]);

        if ($sortField && $sortDirection && in_array($sortDirection, ['asc', 'desc'])) {
            if ($sortField === CampaignsSortBy::AMOUNT()->value) {
                $query->orderBy(CampaignsSortBy::AMOUNT()->value, $sortDirection);
            } elseif ($sortField === CampaignsSortBy::PROPOSALSCOUNT()->value) {
                $query->orderBy(CampaignsSortBy::PROPOSALSCOUNT()->value, $sortDirection);
            }
        }

        return $query->get();
    }

    private function getActiveFundQuickPitches(Fund $fund, ProposalRepository $proposals)
    {
        try {
            $rawProposals = Proposal::forQuickPitch()
                ->with([
                    'campaign:id,title,slug',
                    'fund:id,title,slug',
                    'team.model' => function ($query) {
                        $query->select('id', 'name', 'username');
                    },
                ])
                ->whereNotNull('quickpitch')
                ->where('fund_id', $fund->id)
                ->get();

            // Apply weighted randomization favoring shorter videos, limit to 9
            $weightedRandomizer = new WeightedRandomizeQuickPitches;
            $finalProposals = $weightedRandomizer($rawProposals, 9);

            $this->addTeamBasedCounts($finalProposals);

            return ProposalData::collect($finalProposals);
        } catch (\Throwable $e) {
            \Log::error('Error in getActiveFundQuickPitches', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            report($e);

            return collect([]);
        }
    }

    /**
     * Optimized method to add proposal counts using team relationships and Eloquent
     */
    private function addTeamBasedCounts($proposals)
    {
        if ($proposals->isEmpty()) {
            return;
        }

        $allProfileIds = collect();
        $proposalProfileMap = [];

        foreach ($proposals as $proposal) {
            $profileIds = [];
            if ($proposal->team && $proposal->team->isNotEmpty()) {
                $profileIds = $proposal->team->pluck('model.id')->filter()->values()->toArray();
            }
            $proposalProfileMap[$proposal->id] = $profileIds;
            $allProfileIds = $allProfileIds->merge($profileIds);
        }

        $uniqueProfileIds = $allProfileIds->unique()->values()->toArray();

        if (empty($uniqueProfileIds)) {
            foreach ($proposals as $proposal) {
                $proposal->connections_count = 0;
                $proposal->completed_proposals_count = 0;
                $proposal->outstanding_proposals_count = 0;
            }

            return;
        }

        $completedCounts = Proposal::where('status', 'complete')
            ->whereHas('team', function ($query) use ($uniqueProfileIds) {
                $query->whereIn('profile_id', $uniqueProfileIds);
            })
            ->with(['team' => function ($query) use ($uniqueProfileIds) {
                $query->whereIn('profile_id', $uniqueProfileIds);
            }])
            ->get()
            ->flatMap(function ($proposal) {
                return $proposal->team->pluck('profile_id');
            })
            ->countBy()
            ->toArray();

        $outstandingCounts = Proposal::where('status', 'in_progress')
            ->whereHas('team', function ($query) use ($uniqueProfileIds) {
                $query->whereIn('profile_id', $uniqueProfileIds);
            })
            ->with(['team' => function ($query) use ($uniqueProfileIds) {
                $query->whereIn('profile_id', $uniqueProfileIds);
            }])
            ->get()
            ->flatMap(function ($proposal) {
                return $proposal->team->pluck('profile_id');
            })
            ->countBy()
            ->toArray();

        $connectionCounts = Connection::whereIn('previous_model_id', $uniqueProfileIds)
            ->where('previous_model_type', IdeascaleProfile::class)
            ->selectRaw('previous_model_id, COUNT(*) as count')
            ->groupBy('previous_model_id')
            ->pluck('count', 'previous_model_id')
            ->toArray();

        foreach ($proposals as $proposal) {
            $profileIds = $proposalProfileMap[$proposal->id];

            $proposal->completed_proposals_count = 0;
            $proposal->outstanding_proposals_count = 0;
            $proposal->connections_count = 0;

            foreach ($profileIds as $profileId) {
                $proposal->completed_proposals_count += $completedCounts[$profileId] ?? 0;
                $proposal->outstanding_proposals_count += $outstandingCounts[$profileId] ?? 0;
                $proposal->connections_count += $connectionCounts[$profileId] ?? 0;
            }
        }
    }

    private function getAllCounts(array $ideascaleProfileIds): array
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

    private function getProposals(Fund $activeFund, ProposalRepository $proposals)
    {
        try {
            return ProposalData::collect(
                Proposal::with(['users', 'campaign', 'fund'])
                    ->whereNotNull('quickpitch')
                    ->where('fund_id', '=', $activeFund->id)
                    ->limit(3)
                    ->inRandomOrder()
                    ->get()
            );
        } catch (\Throwable $e) {
            report($e);

            return collect([]);
        }
    }

    public function getProposalsCountByYear()
    {
        $yearCounts = Proposal::selectRaw('EXTRACT(YEAR FROM created_at) as year, COUNT(*) as count')
            ->where('type', 'proposal')
            ->whereNull('deleted_at')
            ->whereNotNull('created_at')
            ->groupBy('year')
            ->orderBy('year')
            ->pluck('count', 'year')
            ->toArray();

        $chartData = [];

        foreach (array_keys($yearCounts) as $year) {
            $year = (int) $year;

            $fundedCount = $this->getFundedCountByYear($year);
            $completedCount = $this->getCompletedCountByYear($year);
            $unfundedCount = $this->getUnfundedCountByYear($year);

            $chartData[] = [
                'year' => (string) $year,
                'Unfunded Proposals' => $unfundedCount ?? 0,
                'Funded Proposals' => $fundedCount ?? 0,
                'Completed Proposals' => $completedCount ?? 0,
            ];
        }

        return $chartData;
    }

    private function getFundedCountByYear($year): int
    {
        $fundedCount = Proposal::whereYear('created_at', $year)
            ->whereIn('funding_status', [
                ProposalFundingStatus::funded()->value,
                ProposalFundingStatus::leftover()->value,
            ])
            ->count();

        return $fundedCount;
    }

    private function getCompletedCountByYear($year): int
    {
        $completedCount = Proposal::whereYear('created_at', $year)
            ->where('status', ProposalStatus::complete()->value)
            ->count();

        return $completedCount;
    }

    private function getUnfundedCountByYear($year): int
    {
        $unfundedCount = Proposal::whereYear('created_at', $year)
            ->where('status', ProposalStatus::unfunded()->value)
            ->count();

        return $unfundedCount;
    }

    private function getTallies(Fund $fund, int $perPage = 10, int $page = 1): array
    {
        try {
            // Build cache key including all filters
            $filterHash = hash('sha256', serialize([
                'search' => $this->queryParams[ProposalSearchParams::QUERY()->value] ?? null,
                'sort' => $this->queryParams[ProposalSearchParams::SORTS()->value] ?? null,
                'campaigns' => $this->queryParams[ProposalSearchParams::CAMPAIGNS()->value] ?? null,
                'funds' => $this->queryParams[ProposalSearchParams::FUNDS()->value] ?? null,
            ]));
            $cacheKey = $this->buildTalliesCacheKey($fund->id, $page, $perPage).'_'.$filterHash;

            $cached = \Cache::get($cacheKey);
            if ($cached && ! app()->environment('local')) {
                return $cached;
            }

            $searchQuery = $this->queryParams[ProposalSearchParams::QUERY()->value] ?? null;
            $sortParam = $this->queryParams[ProposalSearchParams::SORTS()->value] ?? null;
            $campaignFilter = $this->queryParams[ProposalSearchParams::CAMPAIGNS()->value] ?? null;
            $fundFilter = $this->queryParams[ProposalSearchParams::FUNDS()->value] ?? null;

            $sortField = 'tally';
            $sortDirection = 'desc';
            $sortTable = 'catalyst_tallies';
            if ($sortParam) {
                [$sortField, $sortDirection] = explode(':', $sortParam);
                if ($sortField === 'votes_count') {
                    $sortField = 'tally';
                    $sortTable = 'catalyst_tallies';
                } elseif ($sortField === 'amount_requested') {
                    $sortField = 'amount_requested';
                    $sortTable = 'proposals';
                }
            }

            // Determine which fund(s) to show tallies for
            $targetFundIds = ! empty($fundFilter) && is_array($fundFilter) ? $fundFilter : [$fund->id];

            // Calculate total votes for the target fund(s)
            $cacheKeySuffix = count($targetFundIds) === 1 ? $targetFundIds[0] : hash('sha256', implode(',', $targetFundIds));
            $totalVotesCast = \Cache::remember(
                "funds_{$cacheKeySuffix}_total_votes",
                now()->addHours(2),
                fn () => CatalystTally::whereIn('context_id', $targetFundIds)->sum('tally')
            );

            $baseQuery = CatalystTally::query()
                ->select([
                    'catalyst_tallies.*',
                    'catalyst_tallies.category_rank',
                    'catalyst_tallies.fund_rank',
                    'catalyst_tallies.overall_rank',
                    'catalyst_tallies.chance_approval',
                    'catalyst_tallies.chance_funding',
                    'proposals.id as proposal_id',
                    'proposals.title as proposal_title',
                    'proposals.slug as proposal_slug',
                    'proposals.amount_requested',
                    'proposals.currency as proposal_currency',
                    'proposals.funding_status as proposal_funding_status',
                    'proposals.campaign_id',
                    'campaigns.id as campaign_id',
                    'campaigns.title as campaign_title',
                    'funds.id as fund_id',
                    'funds.title as fund_title',
                    'funds.currency as fund_currency',
                ])
                ->join('proposals', 'catalyst_tallies.model_id', '=', 'proposals.id')
                ->join('campaigns', 'proposals.campaign_id', '=', 'campaigns.id')
                ->join('funds', 'catalyst_tallies.context_id', '=', 'funds.id')
                ->whereIn('catalyst_tallies.context_id', $targetFundIds) // Use fund filter or default to current fund
                ->whereNotNull('catalyst_tallies.model_id');

            if (! empty($campaignFilter) && is_array($campaignFilter)) {
                $baseQuery->whereIn('campaigns.id', $campaignFilter);
            }

            if (! empty($searchQuery)) {
                $searchTerm = trim($searchQuery);

                $baseQuery->where(function ($query) use ($searchTerm) {
                    $query->where('proposals.title', 'ILIKE', "%{$searchTerm}%")
                        ->orWhere('campaigns.title', 'ILIKE', "%{$searchTerm}%");

                    if (strlen($searchTerm) > 3) {
                        $query->orWhereExists(function ($subQuery) use ($searchTerm) {
                            $subQuery->select('*')
                                ->from('proposal_profiles')
                                ->join('catalyst_profiles', 'proposal_profiles.profile_id', '=', 'catalyst_profiles.id')
                                ->whereColumn('proposal_profiles.proposal_id', 'proposals.id')
                                ->where('proposal_profiles.profile_type', CatalystProfile::class)
                                ->where(function ($nameQuery) use ($searchTerm) {
                                    $nameQuery->where('catalyst_profiles.name', 'ILIKE', "%{$searchTerm}%")
                                        ->orWhere('catalyst_profiles.username', 'ILIKE', "%{$searchTerm}%");
                                });
                        })
                            ->orWhereExists(function ($subQuery) use ($searchTerm) {
                                $subQuery->select('*')
                                    ->from('proposal_profiles')
                                    ->join('ideascale_profiles', 'proposal_profiles.profile_id', '=', 'ideascale_profiles.id')
                                    ->whereColumn('proposal_profiles.proposal_id', 'proposals.id')
                                    ->where('proposal_profiles.profile_type', IdeascaleProfile::class)
                                    ->where(function ($nameQuery) use ($searchTerm) {
                                        $nameQuery->where('ideascale_profiles.name', 'ILIKE', "%{$searchTerm}%")
                                            ->orWhere('ideascale_profiles.username', 'ILIKE', "%{$searchTerm}%");
                                    });
                            });
                    }
                });
            }

            $offset = ($page - 1) * $perPage;

            $talliesQuery = (clone $baseQuery)
                ->orderBy("{$sortTable}.{$sortField}", $sortDirection)
                ->orderBy('catalyst_tallies.id', 'asc')
                ->offset($offset)
                ->limit($perPage);

            $totalCount = $baseQuery->count('catalyst_tallies.id');

            if ($totalCount === 0) {
                return $this->getEmptyTalliesResponse($perPage, $page, $totalVotesCast);
            }

            $talliesWithRanking = $talliesQuery->get();

            $currentLocale = \App::getLocale();

            $talliesWithRanking->each(function ($tally) use ($fund, $currentLocale) {
                // Note: Rankings and chances are now available directly on the tally model
                // No need to fetch metas for these fields

                if ($tally->proposal_id) {
                    $proposal = new Proposal;
                    $proposal->id = $tally->proposal_id;

                    $proposal->title = $this->getTranslatedTitle($tally->proposal_title, $currentLocale);
                    $proposal->slug = $tally->proposal_slug;

                    $proposal->amount_requested = $tally->amount_requested;
                    $proposal->currency = $tally->proposal_currency;
                    $proposal->funding_status = $tally->proposal_funding_status;
                    $proposal->campaign_id = $tally->campaign_id;

                    if ($tally->campaign_id) {
                        $campaign = new Campaign;
                        $campaign->id = $tally->campaign_id;
                        $campaign->title = $this->getTranslatedTitle($tally->campaign_title, $currentLocale);

                        $proposal->setRelation('campaign', $campaign);
                    }

                    $tally->setRelation('proposal', $proposal);
                }

                $fundModel = new Fund;
                $fundModel->id = $fund->id;
                $fundModel->title = $fund->title;
                $fundModel->currency = $fund->currency;
                $tally->setRelation('fund', $fundModel);
            });

            $lastUpdated = $talliesWithRanking->max('updated_at') ?? null;

            $result = [
                ...(to_length_aware_paginator(
                    CatalystTallyData::collect($talliesWithRanking),
                    total: $totalCount,
                    perPage: $perPage,
                    currentPage: $page
                )->onEachSide(0)->toArray()),
                'total' => $totalCount,
                'total_votes_cast' => $totalVotesCast,
                'last_updated' => $lastUpdated->toISOString(),
            ];

            if (! app()->environment('local')) {
                \Cache::put($cacheKey, $result, now()->addMinutes(5));
            }

            return $result;

        } catch (\Throwable $e) {
            \Log::error('Error fetching tallies', [
                'fund_id' => $fund->id,
                'page' => $page,
                'per_page' => $perPage,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->getEmptyTalliesResponse($perPage, $page, 0);
        }
    }

    private function getEmptyTalliesResponse(int $perPage, int $page, int $totalVotesCast): array
    {
        return [
            'data' => [],
            'total' => 0,
            'total_votes_cast' => $totalVotesCast,
            'per_page' => $perPage,
            'current_page' => $page,
            'last_page' => 1,
            'from' => 0,
            'to' => 0,
            'prev_page_url' => null,
            'next_page_url' => null,
            'links' => [],
        ];
    }

    private function buildPaginationUrl(int $page, array $queryParams): string
    {
        $params = array_merge($queryParams, ['p' => $page]);

        return request()->url().'?'.http_build_query($params);
    }

    private function generatePaginationLinks(int $currentPage, int $lastPage, array $queryParams = []): array
    {
        $links = [];
        $baseUrl = request()->url();

        $links[] = [
            'url' => $currentPage > 1 ? $this->buildPaginationUrl($currentPage - 1, $queryParams) : null,
            'label' => '&laquo; Previous',
            'active' => false,
        ];

        $start = max(1, $currentPage - 2);
        $end = min($lastPage, $currentPage + 2);

        if ($start > 1) {
            $links[] = [
                'url' => $this->buildPaginationUrl(1, $queryParams),
                'label' => '1',
                'active' => false,
            ];
            if ($start > 2) {
                $links[] = [
                    'url' => null,
                    'label' => '...',
                    'active' => false,
                ];
            }
        }

        for ($i = $start; $i <= $end; $i++) {
            $links[] = [
                'url' => $this->buildPaginationUrl($i, $queryParams),
                'label' => (string) $i,
                'active' => $i === $currentPage,
            ];
        }

        if ($end < $lastPage) {
            if ($end < $lastPage - 1) {
                $links[] = [
                    'url' => null,
                    'label' => '...',
                    'active' => false,
                ];
            }
            $links[] = [
                'url' => $this->buildPaginationUrl($lastPage, $queryParams),
                'label' => (string) $lastPage,
                'active' => false,
            ];
        }

        $links[] = [
            'url' => $currentPage < $lastPage ? $this->buildPaginationUrl($currentPage + 1, $queryParams) : null,
            'label' => 'Next &raquo;',
            'active' => false,
        ];

        return $links;
    }

    private function buildTalliesCacheKey($fundId, int $page, int $perPage): string
    {
        return "fund_{$fundId}_tallies_page_{$page}_per_{$perPage}";
    }

    private function getTranslatedTitle(?string $title, string $locale = 'en'): ?string
    {
        if (empty($title)) {
            return $title;
        }

        // If title contains translation data (JSON), parse it
        if (str_starts_with($title, '{') && str_ends_with($title, '}')) {
            try {
                $translations = json_decode($title, true);
                if (is_array($translations)) {
                    // Return the translation for the current locale, fallback to English, then first available
                    return $translations[$locale] ?? $translations['en'] ?? reset($translations) ?? $title;
                }
            } catch (\Throwable $e) {
                // If JSON parsing fails, return the original title
                return $title;
            }
        }

        return $title;
    }

    /**
     * Get campaign proposals with pagination and filtering using Eloquent queries
     */
    private function getCampaignProposalsWithPagination(Request $request, Campaign $campaign): array
    {
        $page = (int) $request->get('p', 1);
        $perPage = (int) $request->get('per_page', 24);

        $proposalsQuery = $campaign->proposals()
            ->with(['users', 'campaign', 'fund']);

        if (! empty($this->queryParams[ProposalSearchParams::QUERY()->value])) {
            $searchTerm = trim($this->queryParams[ProposalSearchParams::QUERY()->value]);
            $proposalsQuery->where('title', 'ILIKE', "%{$searchTerm}%");
        }

        if (! empty($this->queryParams[ProposalSearchParams::FUNDING_STATUS()->value])) {
            $fundingStatuses = $this->queryParams[ProposalSearchParams::FUNDING_STATUS()->value];
            if (is_array($fundingStatuses)) {
                $proposalsQuery->whereIn('funding_status', $fundingStatuses);
            }
        }

        if (! empty($this->queryParams[ProposalSearchParams::PROJECT_STATUS()->value])) {
            $projectStatuses = $this->queryParams[ProposalSearchParams::PROJECT_STATUS()->value];
            if (is_array($projectStatuses)) {
                $proposalsQuery->whereIn('status', $projectStatuses);
            }
        }

        if (! empty($this->queryParams[ProposalSearchParams::MIN_BUDGET()->value])) {
            $proposalsQuery->where('amount_requested', '>=', $this->queryParams[ProposalSearchParams::MIN_BUDGET()->value]);
        }
        if (! empty($this->queryParams[ProposalSearchParams::MAX_BUDGET()->value])) {
            $proposalsQuery->where('amount_requested', '<=', $this->queryParams[ProposalSearchParams::MAX_BUDGET()->value]);
        }

        if (! empty($this->queryParams[ProposalSearchParams::TAGS()->value])) {
            $tags = $this->queryParams[ProposalSearchParams::TAGS()->value];
            if (is_array($tags)) {
                // Use raw SQL to handle UUID casting properly
                $placeholders = implode(',', array_fill(0, count($tags), '?'));
                $proposalsQuery->whereRaw(
                    'EXISTS (SELECT 1 FROM model_tag WHERE model_tag.model_id::text = proposals.id::text AND model_tag.model_type = ? AND model_tag.tag_id IN ('.$placeholders.'))',
                    array_merge([\App\Models\Proposal::class], $tags)
                );
            }
        }

        $sortField = 'created_at';
        $sortDirection = 'desc';
        if (! empty($this->queryParams[ProposalSearchParams::SORTS()->value])) {
            $sortParam = $this->queryParams[ProposalSearchParams::SORTS()->value];
            [$field, $direction] = explode(':', $sortParam);

            if (in_array($field, ['created_at', 'title', 'amount_requested', 'funding_status', 'status']) &&
                in_array($direction, ['asc', 'desc'])) {
                $sortField = $field;
                $sortDirection = $direction;
            }
        }

        $proposalsQuery->orderBy($sortField, $sortDirection);

        $proposals = $proposalsQuery->paginate($perPage, ['*'], 'p', $page);

        return [
            'proposals' => ProposalData::collect($proposals->items()),
            'pagination' => [
                'current_page' => $proposals->currentPage(),
                'data' => ProposalData::collect($proposals->items()),
                'first_page_url' => $proposals->url(1),
                'from' => $proposals->firstItem(),
                'last_page' => $proposals->lastPage(),
                'last_page_url' => $proposals->url($proposals->lastPage()),
                'links' => $proposals->linkCollection()->toArray(),
                'next_page_url' => $proposals->nextPageUrl(),
                'path' => $proposals->path(),
                'per_page' => $proposals->perPage(),
                'prev_page_url' => $proposals->previousPageUrl(),
                'to' => $proposals->lastItem(),
                'total' => $proposals->total(),
            ],
        ];
    }
}
