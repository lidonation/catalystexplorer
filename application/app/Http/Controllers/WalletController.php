<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\DataTransferObjects\TransactionData;
use App\DataTransferObjects\VoterHistoryData;
use App\Enums\TransactionSearchParams;
use App\Models\Transaction;
use App\Models\Voter;
use App\Repositories\VoterHistoryRepository;
use App\Services\WalletInfoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Auth;
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

    public function show(Request $request, ?string $param1 = null, ?string $param2 = null): Response
    {
        $stakeKey = null;
        $catId = null;

        foreach ([$param1, $param2] as $param) {
            if (empty($param)) {
                continue;
            }

            if (str_starts_with($param, 'ca1q')) {
                $catId = $param;
            } else {
                $stakeKey = $param;
            }
        }

        $walletStats = $this->getWalletStats($stakeKey ?? '');

        $transactionQuery = Transaction::query();

        if (! empty($param1)) {
            $transactionQuery->where(function ($query) use ($param1) {
                $query->where('json_metadata->stake_key', $param1)
                    ->orWhere('json_metadata->voter_delegations->[0]->catId', $param1);
            });
        }

        if (! empty($param2)) {
            $transactionQuery->orWhere(function ($query) use ($param2) {
                $query->where('json_metadata->stake_key', $param2)
                    ->orWhere('json_metadata->voter_delegations->[0]->catId', $param2);
            });
        }

        $transaction = $transactionQuery->first();

        $transactionsQuery = Transaction::query();

        if (! empty($param1)) {
            $transactionsQuery->where(function ($query) use ($param1) {
                $query->where('json_metadata->stake_key', $param1)
                    ->orWhere('json_metadata->voter_delegations->[0]->catId', $param1);
            });
        }

        if (! empty($param2)) {
            $transactionsQuery->orWhere(function ($query) use ($param2) {
                $query->where('json_metadata->stake_key', $param2)
                    ->orWhere('json_metadata->voter_delegations->[0]->catId', $param2);
            });
        }

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
                $transactionsQuery->paginate(11, ['*'], 'p', request()->query('p', 1))
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
            VoterHistoryData::collect($items->toArray()),
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
            $userId = Auth::id();

            if (! $userId) {
                return $this->emptyPagination($request);
            }

            $page = $request->get('page', 1);
            $limit = $request->get('limit', 4);

            $walletsPaginator = $this->walletInfoService->getUserWallets($userId, $page, $limit);

            $walletsPaginator->withPath($request->url())
                ->appends($request->query());
            $walletsArray = $walletsPaginator->through(fn ($wallet) => $wallet->toArray());

            return Inertia::render('My/Wallets/Index', [
                'connectedWallets' => $walletsPaginator,
            ]);
        } catch (\Exception $e) {
            Log::error("Error loading wallets for user {$userId}: ".$e->getMessage());

            return $this->emptyPagination($request, 'Unable to load wallet data. Please try again.');
        }
    }

    public function destroy(Request $request, string $stakeAddress): JsonResponse|RedirectResponse
    {
        try {
            $userId = Auth::id();

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

            return redirect()->route('my.wallets')->with('success', 'Wallet deleted successfully');
        } catch (\Exception $e) {
            Log::error("💥 Error deleting wallet for stake address {$stakeAddress}: ".$e->getMessage());

            return redirect()->route('my.wallets')->with('error', 'Failed to delete wallet');
        }
    }

    private function emptyPagination(Request $request, ?string $error = null): Response
    {
        $data = [
            'connectedWallets' => [
                'data' => [],
                'current_page' => 1,
                'last_page' => 1,
                'per_page' => $request->get('limit', 4),
                'total' => 0,
            ],
        ];

        if ($error) {
            $data['error'] = $error;
        }

        return Inertia::render('My/Wallets/Index', $data);
    }
}
