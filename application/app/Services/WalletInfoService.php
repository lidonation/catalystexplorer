<?php

declare(strict_types=1);

namespace App\Services;

use App\Repositories\VoterHistoryRepository;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Fluent;

class WalletInfoService
{
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
            return Cache::remember("wallet_stats_{$stakeAddress}", now()->addHours(2), function () use ($stakeAddress) {

                Log::info("✔️ Fetching wallet data for {$stakeAddress}");

                // Get Blockfrost data (balance, status, payment addresses)
                $blockfrostData = $this->getBlockfrostData($stakeAddress);

                // Get voting data using your existing MeiliSearch pattern
                $votingData = $this->getVotingStats($stakeAddress);

                $result = array_merge($blockfrostData, $votingData);

                Log::info("✔️ Wallet stats completed for {$stakeAddress}: ".json_encode($result));

                return $result;
            });
        } catch (\Throwable $e) {
            Log::error("💥 WalletStats Exception for {$stakeAddress}: {$e->getMessage()}", [
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

    private function getVotingStats(string $stakeAddress): array
    {
        try {
            $args = [
                'filter' => ["stake_address = '{$stakeAddress}'"],
                'limit' => 10000, // Get all votes for accurate counting
                'offset' => 0,
                'facets' => ['choice', 'snapshot.fund.title'], // Use same facets as your controller
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

            Log::info('✔️ Found funds participated: '.json_encode($fundsParticipated));
            Log::info('✔️ Choice distribution: '.json_encode($choiceStats));

            return [
                'all_time_votes' => $totalVotes,
                'funds_participated' => $fundsParticipated,
                'choice_stats' => $choiceStats,
                'voting_details' => [
                    'source' => 'meilisearch',
                    'total_hits' => $totalVotes,
                    'funds_count' => count($fundsParticipated),
                    'facet_distribution' => $facetDistribution,
                ],
            ];

        } catch (\Exception $e) {
            Log::error("Error fetching voting stats via MeiliSearch for {$stakeAddress}: ".$e->getMessage());

            return $this->getVotingStatsFallback($stakeAddress);
        }
    }

    private function getVotingStatsFallback(string $stakeAddress): array
    {
        try {
            Log::info("✔️ Using database fallback for voting stats: {$stakeAddress}");

            $allTimeVotes = \DB::table('voter_histories')
                ->where('stake_address', $stakeAddress)
                ->count();
            $fundsParticipated = \DB::table('voter_histories')
                ->join('snapshots', 'voter_histories.snapshot_id', '=', 'snapshots.id')
                ->join('funds', 'snapshots.fund_id', '=', 'funds.id')
                ->where('voter_histories.stake_address', $stakeAddress)
                ->distinct()
                ->pluck('funds.title')
                ->filter()
                ->values()
                ->all();

            Log::info("✔️ Database fallback - Votes: {$allTimeVotes}, Funds: ".json_encode($fundsParticipated));

            return [
                'all_time_votes' => $allTimeVotes,
                'funds_participated' => $fundsParticipated,
                'choice_stats' => [],
                'voting_details' => [
                    'source' => 'database_fallback',
                    'total_hits' => $allTimeVotes,
                    'funds_count' => count($fundsParticipated),
                ],
            ];

        } catch (\Exception $e) {
            Log::error("Database fallback also failed for {$stakeAddress}: ".$e->getMessage());

            return [
                'all_time_votes' => 0,
                'funds_participated' => [],
                'choice_stats' => [],
                'voting_details' => ['source' => 'error', 'error' => $e->getMessage()],
            ];
        }
    }

    private function getBlockfrostData(string $stakeAddress): array
    {
        $blockfrostKey = config('services.blockfrost.project_id');

        if (! $blockfrostKey) {
            throw new \Exception('Blockfrost project ID not configured');
        }
        $accountResponse = Http::withHeaders([
            'project_id' => $blockfrostKey,
        ])->get("https://cardano-preprod.blockfrost.io/api/v0/accounts/{$stakeAddress}");

        $addressesResponse = Http::withHeaders([
            'project_id' => $blockfrostKey,
        ])->get("https://cardano-preprod.blockfrost.io/api/v0/accounts/{$stakeAddress}/addresses");

        if ($accountResponse->status() === 404) {
            $lovelaces = 0;
            $isDelegated = false;
            $stake_address = $stakeAddress;
            Log::info("Account not found (404) for {$stakeAddress}");
        } elseif (! $accountResponse->successful()) {
            Log::error('Account API call failed: '.$accountResponse->status().' - '.$accountResponse->body());
            throw new \Exception('Blockfrost account call failed: '.$accountResponse->status());
        } else {
            $accountData = $accountResponse->json();
            $lovelaces = (int) ($accountData['controlled_amount'] ?? 0);
            $isDelegated = $accountData['active'] ?? false;
            $stake_address = $accountData['stake_address'] ?? $stakeAddress;
            Log::info("✔️ Successfully fetched account data for {$stakeAddress}");
        }

        $paymentAddresses = [];
        if ($addressesResponse->successful()) {
            $addressesData = $addressesResponse->json();
            $paymentAddresses = collect($addressesData)->pluck('address')->toArray();
            Log::info('✔️ Found '.count($paymentAddresses).' payment addresses');
        } else {
            Log::warning('Failed to fetch payment addresses: '.$addressesResponse->status());
        }
        $ada = number_format($lovelaces / 1_000_000, 2);
        $balance = "{$ada} ADA";

        return [
            'balance' => $balance,
            'status' => $isDelegated,
            'stakeAddress' => $stake_address,
            'payment_addresses' => $paymentAddresses,
        ];
    }

    public function getVotingHistory(string $stakeAddress, int $page = 1, int $limit = 50): array
    {
        try {
            $offset = ($page - 1) * $limit;

            $args = [
                'filter' => ["stake_address = '{$stakeAddress}'"],
                'limit' => $limit,
                'offset' => $offset,
                'sort' => ['time:desc'],
                'facets' => ['choice', 'snapshot.fund.title'],
            ];

            $voterHistories = app(VoterHistoryRepository::class);
            $builder = $voterHistories->search('', $args);
            $response = new Fluent($builder->raw());

            return [
                'votes' => $response->hits ?? [],
                'total' => $response->estimatedTotalHits ?? 0,
                'page' => $page,
                'limit' => $limit,
                'has_more' => ($response->estimatedTotalHits ?? 0) > ($page * $limit),
                'facets' => $response->facetDistribution ?? [],
            ];

        } catch (\Exception $e) {
            Log::error("Error fetching voting history for {$stakeAddress}: ".$e->getMessage());

            return [
                'votes' => [],
                'total' => 0,
                'page' => $page,
                'limit' => $limit,
                'has_more' => false,
                'error' => $e->getMessage(),
            ];
        }
    }
}
