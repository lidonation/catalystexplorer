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
use App\Models\Fund;
use App\Models\Proposal;
use App\Models\Voter;
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

        $page = (int) $request->get('page', 1);
        $perPage = (int) $request->get('per_page', 10);

        return Inertia::render('ActiveFund/Index', [
            'proposals' => Inertia::optional(
                fn () => $this->getProposals($activeFund, $proposals)
            ),
            'fund' => FundData::from($activeFund),
            'campaigns' => $campaigns,
            'amountDistributed' => $amountDistributed,
            'amountRemaining' => $amountRemaining,
            'votingStats' => $this->getVotingStatsFromDatabase($activeFund, $perPage, $page),
        ]);
    }

    protected function getProps(Request $request): void
    {
        $this->queryParams = $request->only([
            ProposalSearchParams::SORTS()->value,
            'page',
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

    private function getVotingStatsFromDatabase(Fund $fund, int $perPage = 10, int $page = 1): array
    {
        try {
            $baseQuery = Voter::with(['voting_powers', 'voting_histories'])
                ->select([
                    'voters.*',
                    DB::raw('ROW_NUMBER() OVER (ORDER BY COALESCE(vp.max_voting_power, 0) DESC) as fund_ranking'),
                ])
                ->leftJoin(
                    DB::raw('(
                        SELECT voter_id, MAX(voting_power) as max_voting_power 
                        FROM voting_powers 
                        GROUP BY voter_id
                    ) as vp'),
                    'voters.cat_id', '=', 'vp.voter_id'
                )
                ->orderBy('vp.max_voting_power', 'desc');

            $totalCount = Voter::leftJoin(
                DB::raw('(
                    SELECT voter_id, MAX(voting_power) as max_voting_power 
                    FROM voting_powers 
                    GROUP BY voter_id
                ) as vp'),
                'voters.cat_id', '=', 'vp.voter_id'
            )->count();

            $offset = ($page - 1) * $perPage;
            $lastPage = (int) ceil($totalCount / $perPage);
            $from = $offset + 1;
            $to = min($offset + $perPage, $totalCount);

            $voters = $baseQuery->skip($offset)->take($perPage)->get();

            $votingStats = $voters->map(function ($voter, $index) use ($fund, $offset) {
                $votesCount = $voter->voting_histories->count();

                $latestVotingPower = $voter->voting_powers()->latest()->first();

                $proposalsVotedOn = $voter->voting_histories
                    ->pluck('proposal')
                    ->filter()
                    ->unique()
                    ->count();

                $latestVoterHistory = $voter->voting_histories
                    ->sortByDesc('created_at')
                    ->first();

                $latestProposal = null;
                if ($latestVoterHistory && $latestVoterHistory->proposal) {
                    try {
                        $proposal = Proposal::find($latestVoterHistory->proposal);
                        if ($proposal) {
                            $latestProposal = ProposalData::from($proposal);
                        }
                    } catch (\Illuminate\Database\QueryException $e) {
                        \Log::debug('Skipping proposal lookup due to data type mismatch', [
                            'voter_history_proposal' => $latestVoterHistory->proposal,
                            'error' => $e->getMessage(),
                        ]);
                    }
                }

                if (! $latestProposal) {
                    $proposal = $fund->proposals()
                        ->whereNotNull('title')
                        ->inRandomOrder()
                        ->first();
                    if ($proposal) {
                        $latestProposal = ProposalData::from($proposal);
                    }
                }

                return [
                    'id' => $voter->id,
                    'stake_pub' => $voter->stake_pub,
                    'stake_key' => $voter->stake_key,
                    'voting_pub' => $voter->voting_pub,
                    'voting_key' => $voter->voting_key,
                    'cat_id' => $voter->cat_id,
                    'voting_power' => $latestVotingPower?->voting_power ?: 0,
                    'votes_count' => $votesCount,
                    'proposals_voted_on' => $proposalsVotedOn,
                    'fund_ranking' => $voter->fund_ranking ?: ($offset + $index + 1),
                    'latest_fund' => [
                        'id' => $fund->id,
                        'title' => $fund->title,
                        'currency' => $fund->currency,
                    ],
                    'latest_proposal' => $latestProposal?->toArray(),
                    'created_at' => $voter->created_at,
                    'updated_at' => $voter->updated_at,
                ];
            });

            return [
                'data' => $votingStats->toArray(),
                'total' => $totalCount,
                'per_page' => $perPage,
                'current_page' => $page,
                'last_page' => $lastPage,
                'from' => $totalCount > 0 ? $from : 0,
                'to' => $totalCount > 0 ? $to : 0,
                'prev_page_url' => $page > 1 ? request()->url().'?page='.($page - 1) : null,
                'next_page_url' => $page < $lastPage ? request()->url().'?page='.($page + 1) : null,
                'links' => $this->generatePaginationLinks($page, $lastPage),
            ];
        } catch (\Throwable $e) {
            report($e);

            return [
                'data' => [],
                'total' => 0,
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

    private function generatePaginationLinks(int $currentPage, int $lastPage): array
    {
        $links = [];

        $links[] = [
            'url' => $currentPage > 1 ? request()->url().'?page='.($currentPage - 1) : null,
            'label' => '&laquo; Previous',
            'active' => false,
        ];

        for ($i = 1; $i <= $lastPage; $i++) {
            $links[] = [
                'url' => request()->url().'?page='.$i,
                'label' => (string) $i,
                'active' => $i === $currentPage,
            ];
        }

        $links[] = [
            'url' => $currentPage < $lastPage ? request()->url().'?page='.($currentPage + 1) : null,
            'label' => 'Next &raquo;',
            'active' => false,
        ];

        return $links;
    }
}
