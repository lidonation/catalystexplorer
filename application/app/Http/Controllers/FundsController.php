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

        $allFunds = Fund::orderBy('launched_at', 'desc')->get();

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
            'quickPitches' => $this->getActiveFundQuickPitches($activeFund, $proposals),
        ]);
    }

    protected function getProps(Request $request): void
    {
        $this->queryParams = $request->only([
            ProposalSearchParams::SORTS()->value,
            ProposalSearchParams::QUERY()->value,
            ProposalSearchParams::CAMPAIGNS()->value,
            ProposalSearchParams::FUNDS()->value,
            ProposalSearchParams::PAGE()->value,
            ProposalSearchParams::PER_PAGE()->value,
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
            $rawProposals = Proposal::with(['users', 'campaign', 'fund', 'ideascale_profiles'])
                ->whereNotNull('quickpitch')
                ->where('fund_id', $fund->id)
                ->limit(15)
                ->get();

            $rawProposals->each(function ($proposal) {
                $ideascaleProfileIds = $proposal->ideascale_profiles ? $proposal->ideascale_profiles->pluck('id')->toArray() : [];
                $counts = $this->getAllCounts($ideascaleProfileIds);
                $proposal->connections_count = $counts['catalystConnectionCount'];
                $proposal->completed_proposals_count = $counts['userCompleteProposalsCount'];
                $proposal->outstanding_proposals_count = $counts['userOutstandingProposalsCount'];
            });

            if ($rawProposals->count() < 3) {
                $shuffledProposals = $rawProposals->shuffle();
                \Log::info('FundsController - Less than 3 quickpitches', [
                    'count' => $rawProposals->count(),
                    'returning_as_regular' => $shuffledProposals->count(),
                ]);

                return [
                    'featured' => collect([]),
                    'regular' => ProposalData::collect($shuffledProposals),
                ];
            }

            $shuffledProposals = $rawProposals->shuffle();
            $featuredRaw = $shuffledProposals->take(3);

            $featuredIds = $featuredRaw->pluck('id');
            $regularRaw = $shuffledProposals->skip(3);

            \Log::info('FundsController - Split quickpitches', [
                'featured_count' => $featuredRaw->count(),
                'regular_count' => $regularRaw->count(),
                'total_original' => $rawProposals->count(),
            ]);

            return [
                'featured' => ProposalData::collect($featuredRaw->shuffle()),
                'regular' => ProposalData::collect($regularRaw->shuffle()),
            ];
        } catch (\Throwable $e) {
            \Log::error('Error in getActiveFundQuickPitches', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            report($e);

            return [
                'featured' => collect([]),
                'regular' => collect([]),
            ];
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
            $searchQuery = $this->queryParams[ProposalSearchParams::QUERY()->value] ?? null;
            $sortParam = $this->queryParams[ProposalSearchParams::SORTS()->value] ?? null;

            $sortField = null;
            $sortDirection = null;

            if ($sortParam) {
                [$sortField, $sortDirection] = explode(':', $sortParam);
            }

            $totalVotesCast = CatalystTally::where('context_id', $fund->id)->sum('tally');

            $baseQuery = CatalystTally::query()
                ->with([
                    'proposal:id,title,amount_requested,currency',
                    'proposal.campaign:id,title',
                    'proposal.fund:id,title,currency',
                ])
                ->where('context_id', $fund->id)
                ->whereNotNull('model_id')
                ->whereHas('proposal');

            $campaignFilter = $this->queryParams[ProposalSearchParams::CAMPAIGNS()->value] ?? null;
            if (! empty($campaignFilter) && is_array($campaignFilter)) {
                $baseQuery->whereHas('proposal.campaign', function ($query) use ($campaignFilter) {
                    $query->whereIn('id', $campaignFilter);
                });
            }

            $fundFilter = $this->queryParams[ProposalSearchParams::FUNDS()->value] ?? null;
            if (! empty($fundFilter) && is_array($fundFilter)) {
                $baseQuery->whereHas('proposal.fund', function ($query) use ($fundFilter) {
                    $query->whereIn('id', $fundFilter);
                });
            }

            if (! empty($searchQuery)) {
                $searchTerm = trim($searchQuery);
                $baseQuery->whereHas('proposal', function ($query) use ($searchTerm) {
                    $query->where(function ($subQuery) use ($searchTerm) {
                        $subQuery->where('title', 'ILIKE', "%{$searchTerm}%")
                            ->orWhereHas('campaign', function ($campaignQuery) use ($searchTerm) {
                                $campaignQuery->where('title', 'ILIKE', "%{$searchTerm}%");
                            })
                            ->orWhereHas('team', function ($teamQuery) use ($searchTerm) {
                                $teamQuery->whereHasMorph('model', [
                                    CatalystProfile::class,
                                    IdeascaleProfile::class,
                                ], function ($profileQuery) use ($searchTerm) {
                                    $profileQuery->where(function ($nameQuery) use ($searchTerm) {
                                        $nameQuery->where('name', 'ILIKE', "%{$searchTerm}%")
                                            ->orWhere('username', 'ILIKE', "%{$searchTerm}%");
                                    });
                                });
                            });
                    });
                });
            }

            $totalCount = (clone $baseQuery)->count();

            if ($totalCount === 0) {
                return $this->getEmptyTalliesResponse($perPage, $page, $totalVotesCast);
            }

            $offset = ($page - 1) * $perPage;
            $lastPage = (int) ceil($totalCount / $perPage);
            $from = $offset + 1;
            $to = min($offset + $perPage, $totalCount);

            $orderByColumn = 'tally';
            $orderByDirection = 'desc';

            if ($sortField && $sortDirection && in_array($sortDirection, ['asc', 'desc'])) {
                if ($sortField === 'votes_count') {
                    $orderByColumn = 'tally';
                    $orderByDirection = $sortDirection;
                }
            }

            $talliesWithRanking = $baseQuery
                ->with('metas')
                ->orderBy($orderByColumn, $orderByDirection)
                ->orderBy('id', 'asc')
                ->skip($offset)
                ->take($perPage)
                ->get();

            $tallyStats = $talliesWithRanking->map(function ($tally) use ($fund) {
                $proposal = $tally->proposal;
                $proposalData = null;

                if ($proposal) {
                    try {
                        $proposalData = [
                            'id' => $proposal->id,
                            'title' => $proposal->title,
                            'amount_requested' => $proposal->amount_requested,
                            'currency' => $proposal->currency,
                            'campaign' => $proposal->campaign ? [
                                'id' => $proposal->campaign->id,
                                'title' => $proposal->campaign->title,
                            ] : null,
                        ];
                    } catch (\Throwable $e) {
                        \Log::warning('Error processing proposal data for tally', [
                            'tally_id' => $tally->id,
                            'proposal_id' => $proposal->id,
                            'error' => $e->getMessage(),
                        ]);
                    }
                }

                if (! $proposalData) {
                    $fallbackProposal = $fund->proposals()
                        ->select(['id', 'title', 'amount_requested', 'currency'])
                        ->whereNotNull('title')
                        ->orderBy('id')
                        ->first();

                    if ($fallbackProposal) {
                        $proposalData = [
                            'id' => $fallbackProposal->id,
                            'title' => $fallbackProposal->title,
                            'amount_requested' => $fallbackProposal->amount_requested,
                            'currency' => $fallbackProposal->currency,
                            'campaign' => null,
                        ];
                    }
                }

                $fundRanking = null;
                if ($tally->metas && $tally->metas->isNotEmpty()) {
                    $fundRankMeta = $tally->metas->firstWhere('key', 'fund_rank');
                    if ($fundRankMeta) {
                        $fundRanking = (int) $fundRankMeta->content;
                    }
                }

                return [
                    'id' => $tally->id,
                    'votes_count' => $tally->tally,
                    'fund_ranking' => $fundRanking,
                    'latest_fund' => [
                        'id' => $fund->id,
                        'title' => $fund->title,
                        'currency' => $fund->currency,
                    ],
                    'latest_proposal' => $proposalData,
                    'created_at' => now()->toISOString(),
                    'updated_at' => now()->toISOString(),
                ];
            });

            $queryParams = request()->query();
            $links = $this->generatePaginationLinks($page, $lastPage, $queryParams);

            $lastUpdated = $talliesWithRanking->max('updated_at') ?? now();

            return [
                'data' => $tallyStats->toArray(),
                'total' => $totalCount,
                'total_votes_cast' => $totalVotesCast,
                'per_page' => $perPage,
                'current_page' => $page,
                'last_page' => $lastPage,
                'from' => $from,
                'to' => $to,
                'prev_page_url' => $page > 1 ? $this->buildPaginationUrl($page - 1, $queryParams) : null,
                'next_page_url' => $page < $lastPage ? $this->buildPaginationUrl($page + 1, $queryParams) : null,
                'links' => $links,
                'last_updated' => $lastUpdated->toISOString(),
            ];

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

        // Next link
        $links[] = [
            'url' => $currentPage < $lastPage ? $this->buildPaginationUrl($currentPage + 1, $queryParams) : null,
            'label' => 'Next &raquo;',
            'active' => false,
        ];

        return $links;
    }
}
