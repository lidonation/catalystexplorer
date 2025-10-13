<?php

declare(strict_types=1);

namespace App\Services;

use App\DataTransferObjects\WalletDTO;
use App\Http\Intergrations\LidoNation\Blockfrost\BlockfrostConnector;
use App\Http\Intergrations\LidoNation\Blockfrost\Requests\BlockfrostRequest;
use App\Models\Signature;
use App\Repositories\VoterHistoryRepository;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Fluent;
use Saloon\Exceptions\Request\RequestException;

class WalletInfoService
{
    /**
     * @param  int|null  $cacheTtl  Cache time in seconds. Null disables caching.
     */
    public function __construct(
        protected ?BlockfrostConnector $connector = null,
        protected ?int $cacheTtl = null
    ) {
        $this->connector ??= app(BlockfrostConnector::class);
    }

    public function getWalletStats(string $stakeAddress): array
    {
        if (! $stakeAddress) {
            return [
                'balance' => 'N/A',
                'all_time_votes' => 0,
                'funds_participated' => [],
                'payment_addresses' => [],
                'status' => false,
                'stakeAddress' => '',
            ];
        }

        try {
            if ($this->cacheTtl !== null && $this->cacheTtl > 0) {
                return Cache::remember("wallet_stats_{$stakeAddress}", now()->addSeconds($this->cacheTtl), function () use ($stakeAddress) {
                    return $this->buildWalletStats($stakeAddress);
                });
            }

            return $this->buildWalletStats($stakeAddress);
        } catch (\Throwable $e) {
            Log::error("WalletStats Exception for {$stakeAddress}: {$e->getMessage()}", [
                'trace' => $e->getTraceAsString(),
            ]);

            return [
                'balance' => 'N/A',
                'all_time_votes' => 0,
                'funds_participated' => [],
                'payment_addresses' => [],
                'status' => false,
                'stakeAddress' => $stakeAddress,
            ];
        }
    }

    private function buildWalletStats(string $stakeAddress): array
    {
        $blockfrostData = $this->getBlockfrostData($stakeAddress);
        $votingData = $this->getVotingStats($stakeAddress);
        $result = array_merge($blockfrostData, $votingData);

        Log::info("Wallet stats completed for {$stakeAddress}", [
            'result' => $result,
        ]);

        return $result;
    }

    private function getBlockfrostData(string $stakeAddress): array
    {
        // Check if Blockfrost is properly configured
        if (! $this->connector->isConfigured()) {
            Log::warning("Blockfrost not configured, returning default data for {$stakeAddress}", [
                'missing_config' => 'BLOCKFROST_PROJECT_ID',
            ]);

            return [
                'balance' => 'N/A',
                'status' => false,
                'stakeAddress' => $stakeAddress,
                'payment_addresses' => [],
            ];
        }

        try {
            $accountResponse = $this->connector->send(
                new BlockfrostRequest("/accounts/{$stakeAddress}")
            );

            $addressesResponse = $this->connector->send(
                new BlockfrostRequest("/accounts/{$stakeAddress}/addresses")
            );

            return $this->processBlockfrostResponse(
                $stakeAddress,
                $accountResponse,
                $addressesResponse
            );
        } catch (RequestException $e) {
            $response = $e->getResponse();
            if ($response) {
                Log::error('Blockfrost error body: '.$response->body());
            }
            throw $e;
        }
    }

    private function processBlockfrostResponse(string $stakeAddress, $accountResponse, $addressesResponse): array
    {
        $lovelaces = 0;
        $isDelegated = false;
        $stake_address = $stakeAddress;
        $paymentAddresses = [];

        try {
            $accountData = $accountResponse->json();
            $lovelaces = (int) ($accountData['controlled_amount'] ?? 0);
            $isDelegated = $accountData['active'] ?? false;
            $stake_address = $accountData['stake_address'] ?? $stakeAddress;
        } catch (\Throwable $e) {
            Log::error("Failed decoding account response for {$stakeAddress}: ".$e->getMessage());
        }

        try {
            $addressesData = $addressesResponse->json();
            $paymentAddresses = collect($addressesData)->pluck('address')->toArray();
        } catch (\Throwable $e) {
            Log::error("Failed decoding addresses response for {$stakeAddress}: ".$e->getMessage());
        }

        $ada = number_format($lovelaces / 1_000_000, 2);

        return [
            'balance' => $ada,
            'status' => $isDelegated,
            'stakeAddress' => $stake_address,
            'payment_addresses' => $paymentAddresses,
        ];
    }

    private function getVotingStats(string $stakeAddress): array
    {
        try {
            $args = [
                'filter' => ["stake_address = '{$stakeAddress}'"],
                'limit' => 10000,
                'offset' => 0,
                'facets' => ['choice', 'snapshot.fund.title'],
            ];

            $voterHistories = app(VoterHistoryRepository::class);
            $builder = $voterHistories->search('', $args);
            $response = new Fluent($builder->raw());

            $totalVotes = $response->estimatedTotalHits ?? 0;
            $facetDistribution = $response->facetDistribution ?? [];
            $fundsParticipated = [];
            if (isset($facetDistribution['snapshot.fund.title'])) {
                $fundsParticipated = array_keys($facetDistribution['snapshot.fund.title']);
            }
            $choiceStats = [];
            if (isset($facetDistribution['choice'])) {
                $choiceStats = $facetDistribution['choice'];
            }

            return [
                'all_time_votes' => $totalVotes,
                'funds_participated' => $fundsParticipated,
                'choice_stats' => $choiceStats,
            ];
        } catch (\Exception $e) {
            Log::error("Error fetching voting stats via MeiliSearch for {$stakeAddress}: ".$e->getMessage());

            return [
                'all_time_votes' => 0,
                'funds_participated' => [],
                'choice_stats' => [],
            ];
        }
    }

    public function getUserWallets(string $userId, int $page = 1, int $limit = 4): LengthAwarePaginator
    {
        $uniqueStakeAddresses = Signature::forUser($userId)
            ->uniqueWallets()
            ->pluck('stake_address');

        if ($uniqueStakeAddresses->isEmpty()) {
            return $this->createEmptyPaginator($limit, $page);
        }

        $total = $uniqueStakeAddresses->count();
        $offset = ($page - 1) * $limit;
        $paginatedAddresses = $uniqueStakeAddresses->slice($offset, $limit);

        $signatures = Signature::whereIn('stake_address', $paginatedAddresses)
            ->get()
            ->groupBy('stake_address')
            ->map(fn ($group) => $group->first());

        $walletDTOs = $signatures->map(function (Signature $signature) {
            $walletStats = $signature->wallet_stats;
            $latestInfo = $signature->latest_wallet_info;

            return WalletDTO::fromSignature($signature, $walletStats, $latestInfo);
        })->values();

        return new LengthAwarePaginator(
            $walletDTOs,
            $total,
            $limit,
            $page,
            ['pageName' => 'page']
        );
    }

    private function createEmptyPaginator(int $limit, int $page): LengthAwarePaginator
    {
        return new LengthAwarePaginator(
            collect([]),
            0,
            $limit,
            $page,
            ['pageName' => 'page']
        );
    }
}
