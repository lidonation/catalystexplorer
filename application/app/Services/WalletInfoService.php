<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WalletInfoService
{
    public function getWalletStats(string $stakeAddress): array
    {
        if (! $stakeAddress) {
            return [
                'balance' => 'N/A',
                'all_time_votes' => 0,
                'funds_participated' => [],
            ];
        }

        try {
            return Cache::remember("wallet_stats_{$stakeAddress}", now()->addHours(2), function () use ($stakeAddress) {

                $blockfrostKey = config('services.blockfrost.project_id');

                $response = Http::withHeaders([
                    'project_id' => $blockfrostKey,
                ])->get("https://cardano-preprod.blockfrost.io/api/v0/accounts/{$stakeAddress}");

                if ($response->status() === 404) {
                    $lovelaces = 0;
                    $isDelegated = false;
                    $stake_address = $stakeAddress;
                    Log::info("Account not found (404) for {$stakeAddress}");
                } elseif (! $response->successful()) {
                    throw new \Exception('Blockfrost call failed: '.$response->status());
                } else {
                    $lovelaces = (int) $response->json('controlled_amount', 0);
                    $isDelegated = $response->json('active', false);
                    $stake_address = $response->json('stake_address');
                    Log::info("✔️ Successfully fetched data for {$stakeAddress}");
                }

                $ada = number_format($lovelaces / 1_000_000);
                $balance = "{$ada} ADA";

                $allTimeVotes = DB::table('voter_histories')
                    ->where('stake_address', $stakeAddress)
                    ->count();

                $fundsParticipated = DB::table('voter_histories')
                    ->where('stake_address', $stakeAddress)
                    ->distinct()
                    ->pluck('caster')
                    ->filter()
                    ->values()
                    ->all();

                return [
                    'balance' => $balance,
                    'status' => $isDelegated,
                    'stakeAddress' => $stake_address,
                    'all_time_votes' => $allTimeVotes,
                    'funds_participated' => $fundsParticipated,
                ];
            });
        } catch (\Throwable $e) {
            Log::error("💥 WalletStats Exception: {$e->getMessage()}", [
                'trace' => $e->getTraceAsString(),
            ]);

            return [
                'balance' => 'N/A',
                'all_time_votes' => 0,
                'funds_participated' => [],
            ];
        }
    }
}
