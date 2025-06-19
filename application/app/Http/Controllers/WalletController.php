<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\TransformIdsToHashes;
use App\DataTransferObjects\TransactionData;
use App\DataTransferObjects\VoterHistoryData;
use App\Enums\TransactionSearchParams;
use App\Models\Transaction;
use App\Models\Voter;
use App\Models\VoterHistory;
use App\Repositories\VoterHistoryRepository;
use App\Services\WalletInfoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Fluent;
use Inertia\Inertia;
use Inertia\Response;

class WalletController extends Controller
{
    protected int $limit = 20;

    protected int $currentPage = 1;

    protected array $queryParams = [];

    public function __construct(
        private WalletInfoService $walletInfoService
    ) {}

    public function show(Request $request, string $stakeKey, string $catId): Response
    {

        $walletStats = $this->getWalletStats($stakeKey ?? '');
        $transaction = Transaction::where('json_metadata->voter_delegations->[0]->catId', $catId)
            ->first();
        $transactions = Transaction::where('stake_key', $stakeKey)
            ->orWhere('json_metadata->stake_key', $stakeKey)
            ->orWhere('json_metadata->voter_delegations->[0]->catId', $catId);

        $request->merge([
            TransactionSearchParams::STAKE_KEY()->value => $stakeKey ?? '',
            TransactionSearchParams::CAT_ID()->value => $catId ?? '',
        ]);

        $this->getProps($request);

        $catalystVotes = $this->voterHistoryQuery();

        return Inertia::render('Wallets/Wallet', [
            'filters' => $this->queryParams,
            'catalystVotes' => $catalystVotes,
            'walletTransactions' => TransactionData::collect(
                $transactions->paginate(11, ['*'], 'p', request()->query('p', 1))
            ),
            'transaction' => $transaction,
            'walletStats' => $walletStats,
        ]);
    }

    protected function getProps(Request $request): void
    {
        $this->queryParams = $request->validate([
            TransactionSearchParams::QUERY()->value => 'string|nullable',
            TransactionSearchParams::PAGE()->value => 'int|nullable',
            TransactionSearchParams::LIMIT()->value => 'int|nullable',
            TransactionSearchParams::STAKE_KEY()->value => 'string|nullable',
            TransactionSearchParams::CAT_ID()->value => 'string|nullable',
        ]);
    }

    protected function getUserFilters(): array
    {
        $filters = [];

        if (! empty($this->queryParams[TransactionSearchParams::STAKE_KEY()->value])) {
            $filters[] = "stake_address ='{$this->queryParams[TransactionSearchParams::STAKE_KEY()->value]}'";
        } elseif (! empty($this->queryParams[TransactionSearchParams::CAT_ID()->value])) {
            $filters[] = "caster ='{$this->queryParams[TransactionSearchParams::CAT_ID()->value]}'";
        }

        return $filters;
    }

    protected function voterHistoryQuery()
    {
        $args = [
            'filter' => $this->getUserFilters(),
        ];

        $page = isset($this->queryParams[TransactionSearchParams::PAGE()->value])
            ? (int) $this->queryParams[TransactionSearchParams::PAGE()->value]
            : $this->currentPage;

        $limit = isset($this->queryParams[TransactionSearchParams::LIMIT()->value])
            ? (int) $this->queryParams[TransactionSearchParams::LIMIT()->value]
            : $this->limit;

        $args['offset'] = ($page - 1) * $limit;
        $args['limit'] = $limit;

        $repository = app(VoterHistoryRepository::class);
        $builder = $repository->search(
            $this->queryParams[TransactionSearchParams::QUERY()->value] ?? '',
            $args
        );

        $response = new Fluent($builder->raw());
        $items = collect($response->hits);

        $pagination = new LengthAwarePaginator(
            VoterHistoryData::collect(
                (new TransformIdsToHashes)(
                    collection: $items,
                    model: new VoterHistory
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

        return $pagination;
    }

    private function getWalletStats(string $stakeKey)
    {

        if (! $stakeKey) {
            return [
                'all_time_votes' => 0,
                'funds_participated' => [],
            ];
        }
        $voter = Voter::where('stake_pub', $stakeKey)
            ->with(['voting_powers.snapshot.fund'])
            ->first();

        if (! $voter) {
            return [
                'all_time_votes' => 0,
                'funds_participated' => [],
            ];
        }

        $allTimeVotes = $voter->count();

        $fundsParticipated = $voter->voting_powers->map(function ($votingPower) {
            return $votingPower->snapshot?->fund?->title;
        })->filter()->unique()->values()->all();

        return [
            'all_time_votes' => $allTimeVotes,
            'funds_participated' => $fundsParticipated,
        ];
    }

    public function index(Request $request): Response
    {
        try {
            $userId = auth()->id();
            $page = $request->get('page', 1);
            $limit = $request->get('limit', 4); // 4 wallets per page

            if (! $userId) {
                $emptyPagination = new LengthAwarePaginator(
                    [],
                    0,
                    $limit,
                    $page,
                    [
                        'pageName' => 'page',
                        'path' => $request->url(),
                        'query' => $request->query(),
                    ]
                );

                return Inertia::render('My/Wallets/Index', [
                    'connectedWallets' => $emptyPagination->toArray(),
                ]);
            }

            $signatures = DB::table('signatures')
                ->select([
                    'stake_address',
                    DB::raw('MAX(wallet_provider) as wallet_provider'),
                    DB::raw('MAX(wallet_name) as wallet_name'), // Add wallet_name
                    DB::raw('MAX(updated_at) as last_used'),
                    DB::raw('COUNT(*) as signature_count'),
                    DB::raw('MAX(id) as id'),
                ])
                ->where('user_id', $userId)
                ->whereNotNull('stake_address')
                ->where('stake_address', '!=', '')
                ->groupBy('stake_address')
                ->orderBy('last_used', 'desc')
                ->get();

            if ($signatures->isEmpty()) {
                $emptyPagination = new LengthAwarePaginator(
                    [],
                    0,
                    $limit,
                    $page,
                    [
                        'pageName' => 'page',
                        'path' => $request->url(),
                        'query' => $request->query(),
                    ]
                );

                return Inertia::render('My/Wallets/Index', [
                    'connectedWallets' => $emptyPagination->toArray(),
                ]);
            }

            $total = $signatures->count();
            $offset = ($page - 1) * $limit;
            $paginatedSignatures = $signatures->slice($offset, $limit);

            $walletsData = $paginatedSignatures->map(function ($item) {
                $stats = $this->walletInfoService->getWalletStats($item->stake_address);
                $userAddress = ! empty($stats['payment_addresses'])
                    ? $stats['payment_addresses'][0]
                    : $item->stake_address;

                // Determine the display name with priority: wallet_name > wallet_provider > 'Unknown'
                $displayName = $item->wallet_name
                    ?: ($item->wallet_provider ?: 'Unknown');

                return [
                    'id' => (string) $item->id,
                    'name' => $displayName, // Use wallet_name if available, fallback to wallet_provider
                    'wallet_name' => $item->wallet_name, // Include raw wallet_name
                    'wallet_provider' => $item->wallet_provider, // Keep wallet_provider for reference
                    'networkName' => 'Cardano PreProd',
                    'stakeAddress' => $item->stake_address,
                    'userAddress' => $userAddress,
                    'paymentAddresses' => $stats['payment_addresses'] ?? [],
                    'last_used' => $item->last_used,
                    'signature_count' => $item->signature_count,
                    'walletDetails' => $stats,
                ];
            });

            $pagination = new LengthAwarePaginator(
                $walletsData->values(),
                $total,
                $limit,
                $page,
                [
                    'pageName' => 'page',
                    'path' => $request->url(),
                    'query' => $request->query(),
                ]
            );

            return Inertia::render('My/Wallets/Index', [
                'connectedWallets' => $pagination->toArray(),
            ]);

        } catch (\Exception $e) {
            $emptyPagination = new LengthAwarePaginator(
                [],
                0,
                4,
                1,
                [
                    'pageName' => 'page',
                    'path' => $request->url(),
                    'query' => $request->query(),
                ]
            );

            return Inertia::render('My/Wallets/Index', [
                'connectedWallets' => $emptyPagination->toArray(),
                'error' => 'Unable to load wallet data. Please try again.',
            ]);
        }
    }

    public function destroy(Request $request, string $stakeAddress): JsonResponse|RedirectResponse
    {
        try {
            $userId = auth()->id();

            if (! $userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized',
                ], 401);
            }

            $deletedCount = DB::table('signatures')
                ->where('user_id', $userId)
                ->where('stake_address', $stakeAddress)
                ->delete();

            if ($deletedCount === 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Wallet not found or already deleted',
                ], 404);
            }

            Log::info("✔️ Deleted {$deletedCount} signatures for user {$userId} and stake address {$stakeAddress}");

            // Return a redirect instead of JSON for Inertia
            return redirect()->route('my.wallets')->with('success', 'Wallet deleted successfully');

        } catch (\Exception $e) {
            Log::error("💥 Error deleting wallet for stake address {$stakeAddress}: ".$e->getMessage());

            return redirect()->route('my.wallets')->with('error', 'Failed to delete wallet');
        }
    }

    public function lookupJson(string $stakeKey, WalletInfoService $walletInfoService): JsonResponse
    {
        \Log::info("Fetching wallet stats for: {$stakeKey}");
        $walletDetails = $this->walletInfoService->getWalletStats($stakeKey);

        \Log::info('📦 Returning walletDetails JSON response', [
            'stakeKey' => $stakeKey,
            'walletDetails' => $walletDetails,
        ]);

        return response()->json([
            'walletDetails' => $walletDetails,
        ]);
    }
}
