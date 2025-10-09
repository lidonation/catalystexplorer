<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\DataTransferObjects\CampaignData;
use App\DataTransferObjects\FundData;
use App\Enums\ProposalSearchParams;
use App\Http\Controllers\Concerns\InteractsWithFunds;
use App\Models\Fund;
use App\Models\Snapshot;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ChartsController extends Controller
{
    use InteractsWithFunds;

    /**
     * Display the user's profile form.
     */
    public function index(Request $request): Response
    {
        $this->getProps($request);

        [$selectedFund, $allFunds] = $this->resolveSelectedFund($request);

        $selectedFund->append(['banner_img_url']);

        $page = (int) ($request->get(ProposalSearchParams::PAGE()->value) ?? 1);
        $perPage = (int) ($request->get(ProposalSearchParams::PER_PAGE()->value) ?? 24);

        $routeName = $request->route()?->getName();
        $normalizedRouteName = $routeName && str_contains($routeName, 'charts.')
            ? 'charts.'.Str::after($routeName, 'charts.')
            : $routeName;

        $baseProps = [
            'fund' => FundData::from($selectedFund),
            'funds' => $allFunds,
            'filters' => $this->queryParams,
            'activeTabRoute' => $normalizedRouteName,
        ];

        return match ($normalizedRouteName) {
            'charts.registrations' => $this->renderRegistrations($baseProps, $selectedFund),
            'charts.confirmedVoters' => Inertia::render('Charts/AllCharts/ConfirmedVoters/index', $baseProps),
            'charts.leaderboards' => Inertia::render('Charts/AllCharts/Leaderboards/index', $baseProps),
            'charts.liveTally' => $this->renderLiveTally($baseProps, $selectedFund, $perPage, $page),
            default => $this->renderLiveTally([
                ...$baseProps,
                'activeTabRoute' => 'charts.liveTally',
            ], $selectedFund, $perPage, $page),
        };
    }

    private function renderLiveTally(array $baseProps, Fund $selectedFund, int $perPage, int $page): Response
    {
        return Inertia::render('Charts/AllCharts/LiveTally/index', [
            ...$baseProps,
            'campaigns' => Inertia::optional(function () use ($selectedFund) {
                $campaigns = $this->getCampaigns($selectedFund);
                $campaigns->each->append([
                    'total_requested',
                    'total_awarded',
                    'total_distributed',
                ]);

                return CampaignData::collect($campaigns);
            }),
            'tallies' => Inertia::optional(fn () => $this->getTallies($selectedFund, $perPage, $page)),
        ]);
    }

    private function renderRegistrations(array $baseProps, Fund $selectedFund): Response
    {
        $registrations = $this->buildRegistrationsData($selectedFund);

        return Inertia::render('Charts/AllCharts/Registrations/index', [
            ...$baseProps,
            'registrations' => $registrations,
        ]);
    }

    private function buildRegistrationsData(Fund $selectedFund): array
    {
        $snapshotIds = $this->getSnapshotIdsForFund($selectedFund);

        if (empty($snapshotIds)) {
            return [
                'fundId' => $selectedFund->getKey(),
                'ranges' => [],
                'totals' => [
                    'total_registered_ada_power' => 0.0,
                    'ada_not_voted' => 0.0,
                    'wallets_not_voted' => 0,
                    'total_registrations' => 0,
                    'delegated_ada_power' => 0.0,
                    'delegated_wallets' => 0,
                ],
            ];
        }

        return [
            'fundId' => $selectedFund->getKey(),
            'ranges' => $this->getAdaPowerRanges($snapshotIds),
            'totals' => $this->getRegistrationTotals($snapshotIds, $selectedFund),
        ];
    }

    private function getAdaPowerRanges(array $snapshotIds): array
    {
        $query = DB::table('voting_powers as vp')
            ->selectRaw(
                "CASE\n                WHEN voting_power BETWEEN 0 AND 450000000 THEN '25-450-1'\n                WHEN voting_power BETWEEN 450000000 AND 1000000000 THEN '450-1k-5'\n                WHEN voting_power BETWEEN 1000000000 AND 5000000000 THEN '1k-5k-7'\n                WHEN voting_power BETWEEN 5000000000 AND 10000000000 THEN '5K-10k-9'\n                WHEN voting_power BETWEEN 10000000000 AND 25000000000 THEN '10K-25k-11'\n                WHEN voting_power BETWEEN 25000000000 AND 50000000000 THEN '25k-50k-13'\n                WHEN voting_power BETWEEN 50000000000 AND 75000000000 THEN '50k-75k-15'\n                WHEN voting_power BETWEEN 75000000000 AND 100000000000 THEN '75k-100k-18'\n                WHEN voting_power BETWEEN 100000000000 AND 250000000000 THEN '100k-250k-20'\n                WHEN voting_power BETWEEN 250000000000 AND 500000000000 THEN '250k-500k-22'\n                WHEN voting_power BETWEEN 500000000000 AND 750000000000 THEN '500k-750k-24'\n                WHEN voting_power BETWEEN 750000000000 AND 1000000000000 THEN '750k-1M-26'\n                WHEN voting_power BETWEEN 1000000000000 AND 5000000000000 THEN '1M-5M-28'\n                WHEN voting_power BETWEEN 5000000000000 AND 10000000000000 THEN '5M-10M-30'\n                WHEN voting_power BETWEEN 10000000000000 AND 15000000000000 THEN '10M-15M-32'\n                WHEN voting_power BETWEEN 15000000000000 AND 21000000000000 THEN '15M-21M-35'\n                WHEN voting_power BETWEEN 21000000000000 AND 30000000000000 THEN '21M-30M-38'\n                WHEN voting_power BETWEEN 30000000000000 AND 45000000000000 THEN '30M-45M-41'\n                WHEN voting_power BETWEEN 45000000000000 AND 75000000000000 THEN '45M-75M-44'\n                WHEN voting_power BETWEEN 75000000000000 AND 100000000000000 THEN '75M-100M-50'\n                WHEN voting_power > 100000000000000 THEN '> 100M-54'\n                END as range_key,  COUNT(*) as wallets, SUM(voting_power) as ada"
            )
            ->whereIn('vp.snapshot_id', $snapshotIds)
            ->where('voting_power', '>=', 25000000)
            ->groupByRaw('1');

        $results = $query->get()
            ->map(function ($row) {
                [$label, $order] = $this->normalizeRangeLabel((string) $row->range_key);

                return [
                    'label' => $label,
                    'count' => (int) ($row->wallets ?? 0),
                    'total_ada' => $this->normalizeAda($row->ada ?? 0),
                    'order' => $order,
                ];
            })
            ->filter(fn ($row) => $row['label'] !== null)
            ->values()
            ->all();

        usort($results, fn ($a, $b) => $a['order'] <=> $b['order']);

        return array_map(function ($row) {
            return [
                'label' => $row['label'],
                'count' => $row['count'],
                'total_ada' => $row['total_ada'],
            ];
        }, $results);
    }

    private function getRegistrationTotals(array $snapshotIds, Fund $selectedFund): array
    {
        $baseQuery = DB::table('voting_powers as vp')
            ->whereIn('vp.snapshot_id', $snapshotIds);

        $totalVotingPower = (clone $baseQuery)->sum('vp.voting_power');
        $adaNotVoted = (clone $baseQuery)->where('vp.consumed', false)->sum('vp.voting_power');
        $walletsNotVoted = (clone $baseQuery)->where('vp.consumed', false)->count('vp.voter_id');
        $totalRegistrations = (clone $baseQuery)->count();

        $delegationBase = DB::table('voting_powers as vp')
            ->joinSub(
                DB::table('delegations')
                    ->select('cat_onchain_id')
                    ->groupBy('cat_onchain_id')
                    ->havingRaw('COUNT(*) > 1'),
                'delegators',
                'vp.voter_id',
                '=',
                'delegators.cat_onchain_id'
            )
            ->leftJoin('snapshots as s', 'vp.snapshot_id', '=', 's.id')
            ->where('s.model_type', Fund::class)
            ->where('s.model_id', $selectedFund->getKey());

        $delegatedAda = (clone $delegationBase)->sum('vp.voting_power');
        $delegatedRegistrations = (clone $delegationBase)->distinct('vp.id')->count('vp.id');

        return [
            'total_registered_ada_power' => $this->normalizeAda($totalVotingPower),
            'ada_not_voted' => $this->normalizeAda($adaNotVoted),
            'wallets_not_voted' => (int) $walletsNotVoted,
            'total_registrations' => (int) $totalRegistrations,
            'delegated_ada_power' => $this->normalizeAda($delegatedAda),
            'delegated_wallets' => (int) $delegatedRegistrations,
        ];
    }

    private function normalizeRangeLabel(string $range): array
    {
        $parts = array_map('trim', explode('-', $range));

        if (count($parts) >= 3) {
            $label = sprintf('%s - %s', $parts[0], $parts[1]);
            $order = (int) ($parts[2] ?? 0);
        } else {
            $label = $parts[0] ?? null;
            $order = (int) ($parts[1] ?? 0);
        }

        return [$label, $order];
    }

    private function normalizeAda(?float $value): float
    {
        if (empty($value)) {
            return 0.0;
        }

        return round($value / 1_000_000, 2);
    }

    /**
     * @return string[]
     */
    private function getSnapshotIdsForFund(Fund $selectedFund): array
    {
        return Snapshot::query()
            ->where('model_type', Fund::class)
            ->where('model_id', $selectedFund->getKey())
            ->pluck('id')
            ->all();
    }
}
