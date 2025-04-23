<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\TransformIdsToHashes;
use App\DataTransferObjects\TransactionData;
use App\Enums\TransactionSearchParams;
use App\Models\Signatures;
use App\Models\Transaction;
use App\Repositories\TransactionRepository;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Fluent;
use Inertia\Inertia;
use Inertia\Response;

class TransactionController
{
    protected int $limit = 20;

    protected int $currentPage = 1;

    protected array $queryParams = [];

    protected ?string $sortBy = 'created_at';

    protected ?string $sortOrder = 'desc';

    protected array $userStakeKeys = [];

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $this->getProps($request);

        $transactions = $this->query();

        return Inertia::render('Transactions/Index', [
            'transactions' => $transactions,
            'filters' => $this->queryParams,
            'metadataLabels' => [
                61284 => 'Catalyst voting registration',
                61285 => 'Catalyst voting submission',
                61286 => 'Catalyst voting rewards',
            ],
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show($txHash)
    {
        $catalystTransaction = Transaction::where('tx_hash', $txHash)->firstOrFail();

        $labels = [
            61284 => 'Catalyst voting registration',
            61285 => 'Catalyst voting submission',
            61286 => 'Catalyst voting rewards',
        ];

        // Get all labels as an array
        $labelIds = json_decode($catalystTransaction->metadata_labels ?? '[]', true);
        $labelNames = collect($labelIds)->map(function ($labelId) use ($labels) {
            return [
                'id' => $labelId,
                'name' => $labels[$labelId] ?? 'Unknown',
            ];
        })->toArray();

        return Inertia::render('Transactions/TransactionDetail', [
            'transaction' => $catalystTransaction,
            'metadataLabels' => $labelNames,
        ]);
    }

    /**
     * Display transactions for the authenticated user.
     */
    public function userTransaction(Request $request): Response
    {
        $this->getProps($request);

        $user = $request->user();

        $this->userStakeKeys = Signatures::where('user_id', $user->id)
            ->pluck('stake_key')
            ->filter()
            ->toArray();

        $transactions = null;

        if (empty($this->userStakeKeys)) {
            $page = isset($this->queryParams[TransactionSearchParams::PAGE()->value])
                ? (int) $this->queryParams[TransactionSearchParams::PAGE()->value]
                : $this->currentPage;

            $limit = isset($this->queryParams[TransactionSearchParams::LIMIT()->value])
                ? (int) $this->queryParams[TransactionSearchParams::LIMIT()->value]
                : $this->limit;

            $transactions = new LengthAwarePaginator(
                [],
                0,
                $limit,
                $page,
                [
                    'pageName' => 'p',
                    'onEachSide' => 0,
                ]
            );
        } else {
            $transactions = $this->query();
        }

        return Inertia::render('My/Transactions/Index', [
            'transactions' => $transactions,
            'filters' => $this->queryParams,
            'metadataLabels' => [
                61284 => 'Catalyst voting registration',
                61285 => 'Catalyst voting submission',
                61286 => 'Catalyst voting rewards',
            ],
        ]);
    }

    protected function getProps(Request $request): void
    {
        $this->queryParams = $request->validate([
            TransactionSearchParams::QUERY()->value => 'string|nullable',
            TransactionSearchParams::TYPE()->value => 'string|nullable',
            TransactionSearchParams::EPOCH()->value => 'array|nullable',
            TransactionSearchParams::TX_HASH()->value => 'string|nullable',
            TransactionSearchParams::BLOCK()->value => 'string|nullable',
            TransactionSearchParams::ADDRESS()->value => 'string|nullable',
            TransactionSearchParams::METADATA_LABELS()->value => 'array|nullable',
            TransactionSearchParams::DATE_RANGE()->value => 'array|nullable',
            TransactionSearchParams::PAGE()->value => 'int|nullable',
            TransactionSearchParams::LIMIT()->value => 'int|nullable',
            TransactionSearchParams::SORT()->value => 'string|nullable',
        ]);

        if (! empty($this->queryParams[TransactionSearchParams::SORT()->value])) {
            $sort = collect(
                explode(
                    ':',
                    $this->queryParams[TransactionSearchParams::SORT()->value]
                )
            )->filter();

            $this->sortBy = $sort->first();
            $this->sortOrder = $sort->last();
        }
    }

    protected function query()
    {
        $args = [
            'filter' => $this->getUserFilters(),
        ];

        if ((bool) $this->sortBy && (bool) $this->sortOrder) {
            $args['sort'] = ["$this->sortBy:$this->sortOrder"];
        }

        $page = isset($this->queryParams[TransactionSearchParams::PAGE()->value])
            ? (int) $this->queryParams[TransactionSearchParams::PAGE()->value]
            : $this->currentPage;

        $limit = isset($this->queryParams[TransactionSearchParams::LIMIT()->value])
            ? (int) $this->queryParams[TransactionSearchParams::LIMIT()->value]
            : $this->limit;

        $args['offset'] = ($page - 1) * $limit;
        $args['limit'] = $limit;

        $repository = app(TransactionRepository::class);
        $builder = $repository->search(
            $this->queryParams[TransactionSearchParams::QUERY()->value] ?? '',
            $args
        );

        $response = new Fluent($builder->raw());
        $items = collect($response->hits);

        $pagination = new LengthAwarePaginator(
            TransactionData::collect(
                (new TransformIdsToHashes)(
                    collection: $items,
                    model: new Transaction
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

    protected function getUserFilters(): array
    {
        $filters = [];

        if (! empty($this->queryParams[TransactionSearchParams::TYPE()->value])) {
            $filters[] = "type = '{$this->queryParams[TransactionSearchParams::TYPE()->value]}'";
        }

        if (! empty($this->queryParams[TransactionSearchParams::TX_HASH()->value])) {
            $filters[] = "tx_hash = '{$this->queryParams[TransactionSearchParams::TX_HASH()->value]}'";
        }

        if (! empty($this->queryParams[TransactionSearchParams::BLOCK()->value])) {
            $filters[] = "block = '{$this->queryParams[TransactionSearchParams::BLOCK()->value]}'";
        }

        if (! empty($this->queryParams[TransactionSearchParams::ADDRESS()->value])) {
            $filters[] = "inputs.address = '{$this->queryParams[TransactionSearchParams::ADDRESS()->value]}'";
        }

        if (! empty($this->userStakeKeys)) {
            $stakeKeysList = "'".implode("','", $this->userStakeKeys)."'";
            $filters[] = "stake_key IN [$stakeKeysList]";
        }

        return $filters;
    }
}
