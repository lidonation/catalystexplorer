<?php

declare(strict_types=1);

namespace Database\Seeders;

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
        $snapshot = Snapshot::factory()->create();

        VotingPower::create([
            'snapshot_id' => $snapshot->id,
            'delegate' => 'Delegate 1',
            'voting_power' => 100.25,
            'voter_id' => 'ca1q5q' . substr(hash('sha256', 'test'), 0, 50),
            'consumed' => false,
            'votes_cast' => 0,
        ]);
    }
}