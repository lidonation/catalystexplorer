<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Snapshot;
use App\Models\VotingPower;
use Illuminate\Database\Seeder;

class CatalystVotingPowerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $snapshot = Snapshot::create([
            'snapshot_name' => 'Snapshot 1',
            'model_type' => 'SomeModel',
            'model_id' => 1,
        ]);

        VotingPower::create([
            'snapshot_id' => $snapshot->id,
            'delegate' => 'Delegate 1',
            'voting_power' => 100.25,
            'voter_id' => 1,
            'consumed' => false,
            'votes_cast' => 0,
        ]);
    }
}
