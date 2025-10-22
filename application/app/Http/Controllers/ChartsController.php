<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\DataTransferObjects\CampaignData;
use App\DataTransferObjects\FundData;
use App\Enums\ProposalSearchParams;
use App\Http\Controllers\Concerns\InteractsWithFunds;
use App\Models\Fund;
use App\Models\Meta;
use App\Models\Snapshot;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

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
            'charts.confirmedVoters' => $this->renderConfirmedVoters($baseProps, $selectedFund),
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

    private function renderConfirmedVoters(array $baseProps, Fund $selectedFund): Response
    {
        $confirmedVoters = $this->buildConfirmedVotersData($selectedFund);

        return Inertia::render('Charts/AllCharts/ConfirmedVoters/index', [
            ...$baseProps,
            'confirmedVoters' => $confirmedVoters,
        ]);
    }

    private function buildRegistrationsData(Fund $selectedFund): array
    {
        $snapshotIds = $this->getSnapshotIdsForFund($selectedFund);
        $downloadSnapshotId = $this->resolveSnapshotDownloadId($selectedFund);

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
                'snapshotDownloadId' => $downloadSnapshotId,
            ];
        }

        return [
            'fundId' => $selectedFund->getKey(),
            'ranges' => $this->getAdaPowerRanges($snapshotIds),
            'totals' => $this->getRegistrationTotals($snapshotIds, $selectedFund),
            'snapshotDownloadId' => $downloadSnapshotId,
        ];
    }

    private function buildConfirmedVotersData(Fund $selectedFund): array
    {
        $snapshotIds = $this->getSnapshotIdsForFund($selectedFund);
        $downloadSnapshotId = $this->resolveSnapshotDownloadId($selectedFund);

        if (empty($snapshotIds)) {
            return [
                'fundId' => $selectedFund->getKey(),
                'stats' => [
                    'average_votes_cast' => null,
                    'mode_votes_cast' => null,
                    'median_votes_cast' => null,
                    'total_confirmed_voters' => 0,
                    'total_votes_cast' => 0,
                    'total_voting_power_ada' => 0.0,
                    'total_verified_participant_ada' => 0.0,
                    'yes_votes_ada_sum' => 0.0,
                    'abstain_votes_ada_sum' => 0.0,
                    'delegated_ada_power' => 0.0,
                    'total_wallet_delegations' => 0,
                    'total_unique_wallets' => 0,
                ],
                'ranges' => [],
                'ada_power_ranges' => [],
                'snapshotDownloadId' => $downloadSnapshotId,
            ];
        }

        $confirmedBase = DB::table('voting_powers as vp')
            ->whereIn('vp.snapshot_id', $snapshotIds)
            ->where('vp.consumed', true);

        $averageVotes = (clone $confirmedBase)->avg('vp.votes_cast');

        $modeVotes = DB::table('voting_powers as vp')
            ->selectRaw('mode() WITHIN GROUP (ORDER BY votes_cast) AS mode')
            ->whereIn('vp.snapshot_id', $snapshotIds)
            ->where('vp.consumed', true)
            ->value('mode');

        $medianVotes = DB::table('voting_powers as vp')
            ->selectRaw('PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY votes_cast) AS median')
            ->whereIn('vp.snapshot_id', $snapshotIds)
            ->where('vp.consumed', true)
            ->value('median');

        $totalConfirmed = (clone $confirmedBase)->count('vp.id');
        $totalVotesCast = (clone $confirmedBase)->sum('vp.votes_cast');
        $totalVotingPowerAda = $this->normalizeAda((clone $confirmedBase)->sum('vp.voting_power'));
        $totalUniqueWallets = (clone $confirmedBase)->distinct('vp.voter_id')->count('vp.voter_id');

        $yesVotesAdaSum = (float) DB::table('proposals as p')
            ->where('p.fund_id', $selectedFund->getKey())
            ->sum('p.yes_votes_count');

        $abstainVotesAdaSum = (float) DB::table('proposals as p')
            ->where('p.fund_id', $selectedFund->getKey())
            ->sum('p.abstain_votes_count');

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
            ->whereIn('vp.snapshot_id', $snapshotIds)
            ->where('s.model_type', Fund::class)
            ->where('s.model_id', $selectedFund->getKey())
            ->where('vp.consumed', true);

        $delegatedAdaPower = $this->normalizeAda((clone $delegationBase)->sum('vp.voting_power'));
        $totalWalletDelegations = (clone $delegationBase)->distinct('vp.id')->count('vp.id');

        $ranges = DB::table('voting_powers as vp')
            ->selectRaw(
                "CASE
                WHEN votes_cast BETWEEN 0 AND 1 THEN '0-1-1'
                WHEN votes_cast BETWEEN 2 AND 10 THEN '2-10-2'
                WHEN votes_cast BETWEEN 11 AND 25 THEN '11-25-3'
                WHEN votes_cast BETWEEN 26 AND 50 THEN '26-50-4'
                WHEN votes_cast BETWEEN 51 AND 150 THEN '51-150-5'
                WHEN votes_cast BETWEEN 151 AND 300 THEN '151-300-6'
                WHEN votes_cast BETWEEN 301 AND 600 THEN '301-600-7'
                WHEN votes_cast BETWEEN 601 AND 900 THEN '601-900-8'
                WHEN votes_cast > 900 THEN '> 900-9'
                END as range,
                COUNT(*) as voters,
                SUM(voting_power) as voting_power"
            )
            ->whereIn('vp.snapshot_id', $snapshotIds)
            ->where('vp.consumed', true)
            ->where('vp.votes_cast', '>', 0)
            ->groupByRaw('1')
            ->get()
            ->map(function ($row) {
                [$label, $order] = $this->normalizeRangeLabel($row->range);

                return [
                    'label' => $label,
                    'count' => (int) $row->voters,
                    'total_ada' => $this->normalizeAda((float) $row->voting_power),
                    'order' => $order,
                ];
            })
            ->sortBy('order')
            ->values()
            ->map(fn ($range) => [
                'label' => $range['label'],
                'count' => $range['count'],
                'total_ada' => $range['total_ada'],
            ])
            ->toArray();

        return [
            'fundId' => $selectedFund->getKey(),
            'stats' => [
                'average_votes_cast' => $averageVotes !== null ? (int) floor((float) $averageVotes) : null,
                'mode_votes_cast' => $modeVotes !== null ? (int) $modeVotes : null,
                'median_votes_cast' => $medianVotes !== null ? round((float) $medianVotes, 2) : null,
                'total_confirmed_voters' => $totalConfirmed,
                'total_votes_cast' => $totalVotesCast,
                'total_voting_power_ada' => $totalVotingPowerAda,
                'total_verified_participant_ada' => $totalVotingPowerAda,
                'yes_votes_ada_sum' => round($yesVotesAdaSum, 2),
                'abstain_votes_ada_sum' => round($abstainVotesAdaSum, 2),
                'delegated_ada_power' => $delegatedAdaPower,
                'total_wallet_delegations' => (int) $totalWalletDelegations,
                'total_unique_wallets' => (int) $totalUniqueWallets,
            ],
            'ranges' => $ranges,
            'ada_power_ranges' => $this->getAdaPowerRanges($snapshotIds, true),
            'snapshotDownloadId' => $downloadSnapshotId,
        ];
    }

    private function resolveSnapshotDownloadId(Fund $selectedFund): ?string
    {
        $snapshot = Snapshot::query()
            ->where('model_type', Fund::class)
            ->where('model_id', $selectedFund->getKey())
            ->orderByDesc('snapshot_at')
            ->orderByDesc('order')
            ->orderByDesc('id')
            ->first();

        if ($snapshot === null) {
            return null;
        }

        $hasSnapshotFile = Meta::query()
            ->where('model_type', Snapshot::class)
            ->where('model_id', $snapshot->getKey())
            ->where('key', 'snapshot_file_path')
            ->exists();

        return $hasSnapshotFile ? (string) $snapshot->getKey() : null;
    }

    public function downloadSnapshot(Snapshot $snapshot): StreamedResponse
    {
        $meta = Meta::query()
            ->where('model_type', Snapshot::class)
            ->where('model_id', $snapshot->getKey())
            ->where('key', 'snapshot_file_path')
            ->latest()
            ->first();

        if ($meta === null || empty($meta->content)) {
            abort(404, 'Snapshot file not available.');
        }

        $diskName = config('filesystems.default', 's3');
        $disk = Storage::disk($diskName);
        $path = $meta->content;

        if (! $disk->exists($path)) {
            abort(404, 'Snapshot file not found.');
        }

        $stream = $disk->readStream($path);

        if ($stream === false) {
            abort(500, 'Unable to read snapshot file.');
        }

        $fileName = $this->resolveSnapshotFileName($snapshot, $path);

        return response()->streamDownload(
            function () use ($stream): void {
                try {
                    fpassthru($stream);
                } finally {
                    if (is_resource($stream)) {
                        fclose($stream);
                    }
                }
            },
            $fileName,
            [
                'Content-Type' => 'text/csv',
            ]
        );
    }

    private function resolveSnapshotFileName(Snapshot $snapshot, string $path): string
    {
        if (! empty($snapshot->snapshot_name)) {
            $baseName = pathinfo($snapshot->snapshot_name, PATHINFO_FILENAME);

            return sprintf('%s.csv', $baseName);
        }

        return basename($path) ?: 'snapshot.csv';
    }

    private function getAdaPowerRanges(array $snapshotIds, bool $confirmedOnly = false): array
    {
        $query = DB::table('voting_powers as vp')
            ->selectRaw(
                "CASE\n                WHEN voting_power BETWEEN 0 AND 450000000 THEN '25-450-1'\n                WHEN voting_power BETWEEN 450000000 AND 1000000000 THEN '450-1k-5'\n                WHEN voting_power BETWEEN 1000000000 AND 5000000000 THEN '1k-5k-7'\n                WHEN voting_power BETWEEN 5000000000 AND 10000000000 THEN '5K-10k-9'\n                WHEN voting_power BETWEEN 10000000000 AND 25000000000 THEN '10K-25k-11'\n                WHEN voting_power BETWEEN 25000000000 AND 50000000000 THEN '25k-50k-13'\n                WHEN voting_power BETWEEN 50000000000 AND 75000000000 THEN '50k-75k-15'\n                WHEN voting_power BETWEEN 75000000000 AND 100000000000 THEN '75k-100k-18'\n                WHEN voting_power BETWEEN 100000000000 AND 250000000000 THEN '100k-250k-20'\n                WHEN voting_power BETWEEN 250000000000 AND 500000000000 THEN '250k-500k-22'\n                WHEN voting_power BETWEEN 500000000000 AND 750000000000 THEN '500k-750k-24'\n                WHEN voting_power BETWEEN 750000000000 AND 1000000000000 THEN '750k-1M-26'\n                WHEN voting_power BETWEEN 1000000000000 AND 5000000000000 THEN '1M-5M-28'\n                WHEN voting_power BETWEEN 5000000000000 AND 10000000000000 THEN '5M-10M-30'\n                WHEN voting_power BETWEEN 10000000000000 AND 50000000000000 THEN '10M-50M-32'\n                WHEN voting_power BETWEEN 50000000000000 AND 100000000000000 THEN '50M-100M-35'\n                WHEN voting_power BETWEEN 100000000000000 AND 200000000000000 THEN '100M-200M-38'\n                WHEN voting_power > 200000000000000 THEN '> 200M-41'\n                END as range_key,  COUNT(*) as wallets, SUM(voting_power) as ada"
            )
            ->whereIn('vp.snapshot_id', $snapshotIds)
            ->where('voting_power', '>=', 25000000)
            ->when($confirmedOnly, fn ($query) => $query->where('vp.consumed', true))
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
