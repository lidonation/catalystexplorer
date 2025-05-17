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
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Fluent;
use Inertia\Inertia;
use Inertia\Response;

class WalletController extends Controller
{
    protected int $limit = 20;

    protected int $currentPage = 1;

    protected array $queryParams = [];

    public function show(Request $request, string $stakeKey, string $catId): Response
    {

        $walletStats = $this->getWalletStats($stakeKey ?? '');
        $transactions = Transaction::where('stake_key', $stakeKey)
            ->orWhere('json_metadata->stake_key', $stakeKey);

        $request->merge([
            TransactionSearchParams::STAKE_KEY()->value => $stakeKey ?? '',
        ]);

        $this->getProps($request);

        $catalystVotes = $this->voterHistoryQuery();

        return Inertia::render('Wallets/Wallet', [
            'filters' => $this->queryParams,
            'catalystVotes' => $catalystVotes,
            'walletTransactions' => TransactionData::collect(
                $transactions->paginate(11, ['*'], 'p', request()->query('p', 1))
            ),
            'stakeKey' => $stakeKey,
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
        ]);
    }

    protected function getUserFilters(): array
    {
        $filters = [];

        if (! empty($this->queryParams[TransactionSearchParams::STAKE_KEY()->value])) {
            $filters[] = "stake_address ='{$this->queryParams[TransactionSearchParams::STAKE_KEY()->value]}'";
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
}
