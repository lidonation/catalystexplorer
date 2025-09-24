<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\DataTransferObjects\CampaignData;
use App\DataTransferObjects\FundData;
use App\DataTransferObjects\MetricData;
use App\DataTransferObjects\ProposalData;
use App\Enums\CampaignsSortBy;
use App\Enums\CatalystCurrencies;
use App\Enums\ProposalFundingStatus;
use App\Enums\ProposalSearchParams;
use App\Enums\ProposalStatus;
use App\Models\CatalystTally;
use App\Models\Fund;
use App\Models\Proposal;
use App\Repositories\FundRepository;
use App\Repositories\MetricRepository;
use App\Repositories\ProposalRepository;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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

        return Inertia::render('ActiveFund/Index', [
            'proposals' => Inertia::optional(
                fn () => $this->getProposals($activeFund, $proposals)
            ),
            'fund' => FundData::from($activeFund),
            'campaigns' => $campaigns,
            'amountDistributed' => $amountDistributed,
            'amountRemaining' => $amountRemaining,
            'tallies' => $this->getTallies($activeFund, $perPage, $page),
            'quickPitches' => $this->getActiveFundQuickPitches($activeFund, $proposals),
        ]);
    }

    protected function getProps(Request $request): void
    {
        $this->queryParams = $request->only([
            ProposalSearchParams::SORTS()->value,
            ProposalSearchParams::QUERY()->value,
            'p',
            'per_page',
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
            $rawProposals = $proposals
                ->with(['users', 'campaign', 'fund'])
                ->whereNotNull('quickpitch')
                ->where('fund_id', $fund->id)
                ->limit(15)
                ->get();

            if ($rawProposals->count() < 3) {
                return [
                    'featured' => collect([]),
                    'regular' => ProposalData::collect($rawProposals),
                ];
            }

            $featuredRaw = $rawProposals->random(3);

            $featuredIds = $featuredRaw->pluck('id');
            $regularRaw = $rawProposals->whereNotIn('id', $featuredIds);

            return [
                'featured' => ProposalData::collect($featuredRaw),
                'regular' => ProposalData::collect($regularRaw),
            ];

        } catch (\Throwable $e) {
            report($e);

            return [
                'featured' => collect([]),
                'regular' => collect([]),
            ];
        }
    }

    private function getProposals(Fund $activeFund, ProposalRepository $proposals)
    {
        try {
            return ProposalData::collect(
                $proposals->with(['users', 'campaign', 'fund'])
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
            $searchQuery = $this->queryParams[ProposalSearchParams::QUERY()->value] ?? null;

            $totalVotesCast = CatalystTally::where('context_id', $fund->id)->sum('tally');

            $baseQuery = CatalystTally::with(['proposal.campaign', 'proposal.fund'])
                ->where('context_id', $fund->id)
                ->whereNotNull('model_id');

            // Add search filtering if search query is provided
            if (! empty($searchQuery)) {
                $baseQuery->whereHas('proposal', function ($query) use ($searchQuery) {
                    $query->where('title', 'ILIKE', '%'.$searchQuery.'%')
                        ->orWhereHas('campaign', function ($campaignQuery) use ($searchQuery) {
                            $campaignQuery->where('title', 'ILIKE', '%'.$searchQuery.'%');
                        });
                });
            }

            $baseQuery->select([
                'catalyst_tallies.*',
                DB::raw('ROW_NUMBER() OVER (ORDER BY tally DESC, id ASC) as fund_ranking'),
            ])
                ->orderBy('tally', 'desc')
                ->orderBy('id', 'asc'); // Add secondary sort for consistency

            $totalCountQuery = CatalystTally::where('context_id', $fund->id)
                ->whereNotNull('model_id');

            // Apply the same search filtering to the count query
            if (! empty($searchQuery)) {
                $totalCountQuery->whereHas('proposal', function ($query) use ($searchQuery) {
                    $query->where('title', 'ILIKE', '%'.$searchQuery.'%')
                        ->orWhereHas('campaign', function ($campaignQuery) use ($searchQuery) {
                            $campaignQuery->where('title', 'ILIKE', '%'.$searchQuery.'%');
                        });
                });
            }

            $totalCount = $totalCountQuery->count();

            $offset = ($page - 1) * $perPage;
            $lastPage = (int) ceil($totalCount / $perPage);
            $from = $totalCount > 0 ? $offset + 1 : 0;
            $to = min($offset + $perPage, $totalCount);

            $tallies = $baseQuery->skip($offset)->take($perPage)->get();

            $tallyStats = $tallies->map(function ($tally, $index) use ($fund, $offset) {
                $proposal = null;
                if ($tally->proposal) {
                    try {
                        $proposal = ProposalData::from($tally->proposal);
                    } catch (\Throwable $e) {
                        \Log::debug('Error converting proposal to data object', [
                            'proposal_id' => $tally->model_id,
                            'error' => $e->getMessage(),
                        ]);
                    }
                }

                if (! $proposal) {
                    $proposalModel = $fund->proposals()
                        ->whereNotNull('title')
                        ->orderBy('id')
                        ->first();
                    if ($proposalModel) {
                        $proposal = ProposalData::from($proposalModel);
                    }
                }

                return [
                    'id' => $tally->id,
                    'votes_count' => $tally->tally,
                    'fund_ranking' => $tally->fund_ranking ?: ($offset + $index + 1),
                    'latest_fund' => [
                        'id' => $fund->id,
                        'title' => $fund->title,
                        'currency' => $fund->currency,
                    ],
                    'latest_proposal' => $proposal?->toArray(),
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            });

            $currentUrl = request()->url();
            $queryParams = request()->query();

            $prevPageUrl = null;
            $nextPageUrl = null;

            if ($page > 1) {
                $prevParams = array_merge($queryParams, ['p' => $page - 1]);
                $prevPageUrl = $currentUrl.'?'.http_build_query($prevParams);
            }

            if ($page < $lastPage) {
                $nextParams = array_merge($queryParams, ['p' => $page + 1]);
                $nextPageUrl = $currentUrl.'?'.http_build_query($nextParams);
            }

            return [
                'data' => $tallyStats->toArray(),
                'total' => $totalCount,
                'total_votes_cast' => $totalVotesCast,
                'per_page' => $perPage,
                'current_page' => $page,
                'last_page' => $lastPage,
                'from' => $from,
                'to' => $totalCount > 0 ? $to : 0,
                'prev_page_url' => $prevPageUrl,
                'next_page_url' => $nextPageUrl,
                'links' => $this->generatePaginationLinks($page, $lastPage, $queryParams),
            ];
        } catch (\Throwable $e) {
            report($e);

            return [
                'data' => [],
                'total' => 0,
                'total_votes_cast' => 0,
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
    }

    private function generatePaginationLinks(int $currentPage, int $lastPage, array $queryParams = []): array
    {
        $links = [];
        $baseUrl = request()->url();

        $prevParams = $currentPage > 1 ? array_merge($queryParams, ['p' => $currentPage - 1]) : null;
        $links[] = [
            'url' => $prevParams ? $baseUrl.'?'.http_build_query($prevParams) : null,
            'label' => '&laquo; Previous',
            'active' => false,
        ];

        for ($i = 1; $i <= $lastPage; $i++) {
            $pageParams = array_merge($queryParams, ['p' => $i]);
            $links[] = [
                'url' => $baseUrl.'?'.http_build_query($pageParams),
                'label' => (string) $i,
                'active' => $i === $currentPage,
            ];
        }

        $nextParams = $currentPage < $lastPage ? array_merge($queryParams, ['p' => $currentPage + 1]) : null;
        $links[] = [
            'url' => $nextParams ? $baseUrl.'?'.http_build_query($nextParams) : null,
            'label' => 'Next &raquo;',
            'active' => false,
        ];

        return $links;
    }
}