<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Registration;
use App\Models\Delegation;
use App\Models\Snapshot;
use App\Models\VotingPower;
use App\Models\Fund;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class VotingPowerQuerySeeder extends Seeder
{
    /**
     * Run the database seeds to make the specific voting power query return results.
     * 
     * This seeder creates the necessary data for this query:
     * SELECT reg.stake_pub,
     *     COUNT(DISTINCT cs.model_id) AS distinct_model_ids,
     *     ARRAY_AGG(DISTINCT cs.model_id) AS model_ids
     * FROM public.voting_powers cvp
     * JOIN public.delegations d ON cvp.voter_id = d.cat_onchain_id
     * LEFT JOIN public.snapshots cs ON cvp.snapshot_id = cs.id
     * LEFT JOIN public.registrations reg ON d.registration_id = reg.id
     * WHERE cvp.consumed = true
     *   AND cs.model_id IS NOT NULL
     *   AND reg.stake_pub = 'stake_test1uzn5g2xcvfglke768n2rkdaulrmylhjrwpu8gy8r9hw6n2qnzfarw'
     * GROUP BY reg.stake_pub
     * HAVING COUNT(DISTINCT cs.model_id) > 1;
     */
    public function run(): void
    {
        $targetStakePub = 'stake_test1uzn5g2xcvfglke768n2rkdaulrmylhjrwpu8gy8r9hw6n2qnzfarw';

        // 1. Create or get a registration with the specific stake_pub
        $registration = Registration::firstOrCreate(
            ['stake_pub' => $targetStakePub],
            [
                'tx' => Str::random(64),
                'stake_key' => 'ed25519_pk1' . substr(hash('sha256', 'test_stake_key'), 0, 56),
            ]
        );

        // 2. Create multiple delegations linked to this registration
        $delegations = [];
        for ($i = 1; $i <= 3; $i++) {
            $delegations[] = Delegation::create([
                'registration_id' => $registration->id,
                'voting_pub' => 'ed25519_pk1' . substr(hash('sha256', 'voting_pub_' . $i), 0, 56),
                'weight' => rand(100, 1000),
                'cat_onchain_id' => 'ca1q5q' . substr(hash('sha256', 'delegation_' . $i), 0, 50),
            ]);
        }

        // 3. Get or create funds to use as model_id in snapshots
        $funds = Fund::take(3)->get();
        if ($funds->count() < 3) {
            // Create funds if they don't exist
            for ($i = $funds->count(); $i < 3; $i++) {
                $funds->push(Fund::factory()->create());
            }
            $funds = Fund::take(3)->get();
        }

        // 4. Create snapshots with different model_ids (fund IDs) to satisfy the HAVING condition
        $snapshots = [];
        foreach ($funds as $index => $fund) {
            $snapshots[] = Snapshot::create([
                'snapshot_name' => "Test Snapshot " . ($index + 1),
                'model_type' => Fund::class,
                'model_id' => $fund->id,
                'epoch' => 300 + $index,
                'order' => $index + 1,
                'snapshot_at' => now()->subDays($index),
            ]);
        }

        // 5. Create voting powers that link everything together
        foreach ($delegations as $delegationIndex => $delegation) {
            foreach ($snapshots as $snapshotIndex => $snapshot) {
                VotingPower::create([
                    'snapshot_id' => $snapshot->id,
                    'delegate' => 'Delegate ' . ($delegationIndex + 1) . '-' . ($snapshotIndex + 1),
                    'voting_power' => rand(1000000, 50000000), // Random voting power in lovelace
                    'voter_id' => $delegation->cat_onchain_id,
                    'consumed' => true, // This is crucial for the query
                    'votes_cast' => rand(1, 10),
                ]);
            }
        }

        $this->command->info("VotingPowerQuerySeeder completed successfully!");
        $this->command->info("Created:");
        $this->command->info("- 1 Registration with stake_pub: {$targetStakePub}");
        $this->command->info("- " . count($delegations) . " Delegations");
        $this->command->info("- " . count($snapshots) . " Snapshots");
        $this->command->info("- " . (count($delegations) * count($snapshots)) . " VotingPowers");
        $this->command->info("The query should now return results showing {$registration->stake_pub} with " . count($funds) . " distinct model_ids.");
    }
}
