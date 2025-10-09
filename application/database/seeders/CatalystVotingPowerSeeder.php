<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Delegation;
use App\Models\Fund;
use App\Models\Registration;
use App\Models\Snapshot;
use App\Models\VotingPower;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CatalystVotingPowerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $fund = Fund::query()->first() ?? Fund::factory()->state(['user_id' => null])->create();

        $snapshot = Snapshot::factory()
            ->forFund($fund)
            ->create();

        $lovelaceBuckets = [
            35_000_000,
            280_000_000,
            650_000_000,
            1_800_000_000,
            6_200_000_000,
            18_000_000_000,
            42_000_000_000,
            78_000_000_000,
            160_000_000_000,
            280_000_000_000,
            460_000_000_000,
            720_000_000_000,
            1_600_000_000_000,
            5_800_000_000_000,
            12_500_000_000_000,
            24_000_000_000_000,
            39_000_000_000_000,
            68_000_000_000_000,
            95_000_000_000_000,
            125_000_000_000_000,
        ];

        $voterIds = [];

        foreach ($lovelaceBuckets as $index => $lovelace) {
            $voterId = 'ca1qseed'.substr(Str::uuid()->toString().Str::random(40), 0, 50);
            $voterIds[] = $voterId;

            VotingPower::factory()
                ->state([
                    'snapshot_id' => $snapshot->id,
                    'delegate' => 'Delegate '.($index + 1),
                    'voting_power' => $lovelace,
                    'voter_id' => $voterId,
                    'consumed' => $index % 3 !== 0,
                    'votes_cast' => $index % 3 !== 0 ? random_int(1, 5) : 0,
                ])
                ->create();
        }

        // Create delegations for a subset of voters to exercise delegated metrics
        foreach (array_slice($voterIds, 0, 6) as $offset => $voterId) {
            $registration = Registration::factory()->create([
                'stake_pub' => 'stake_pub_'.$offset,
                'stake_key' => 'stake_key_'.$offset,
            ]);

            Delegation::factory()
                ->for($registration)
                ->forVoter($voterId)
                ->count(2 + $offset % 3)
                ->create();
        }
    }
}