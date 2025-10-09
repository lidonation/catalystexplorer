<?php

namespace Database\Seeders;

use App\Models\Delegation;
use App\Models\Registration;
use App\Models\VotingPower;
use Illuminate\Database\Seeder;

class DelegationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        VotingPower::query()
            ->pluck('voter_id')
            ->unique()
            ->each(function (string $voterId, int $index) {
                $existingCount = Delegation::query()
                    ->where('cat_onchain_id', $voterId)
                    ->count();

                $required = max(0, 2 - $existingCount);

                if ($required === 0) {
                    return;
                }

                $registration = Registration::factory()->create([
                    'tx' => 'delegation_tx_'.$index,
                    'stake_pub' => 'delegation_stake_pub_'.$index,
                    'stake_key' => 'delegation_stake_key_'.$index,
                ]);

                Delegation::factory()
                    ->for($registration)
                    ->forVoter($voterId)
                    ->count($required)
                    ->create();
            });
    }
}
