<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\WeightedRandomizeQuickPitches;
use App\DataTransferObjects\CampaignData;
use App\DataTransferObjects\FundData;
use App\DataTransferObjects\MetricData;
use App\DataTransferObjects\ProposalData;
use App\Enums\CatalystCurrencies;
use App\Enums\ProposalFundingStatus;
use App\Enums\ProposalSearchParams;
use App\Enums\ProposalStatus;
use App\Http\Controllers\Concerns\InteractsWithFunds;
use App\Models\Campaign;
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
    use InteractsWithFunds;

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
