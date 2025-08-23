<?php

namespace Database\Seeders;

use App\Models\Registration;
use App\Models\Snapshot;
use App\Models\Voter;
use App\Models\VoterHistory;
use Illuminate\Database\Seeder;

class VoterSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (Snapshot::count() === 0) {
            Snapshot::factory(10)->create();
        }

        $voters = Voter::factory(50)->create();

        $voters->each(function ($voter) {
            Registration::factory()
                ->count(3)
                ->create([
                    'stake_pub' => $voter->stake_pub,
                ]);
        });

        $voters->each(function ($voter) {
            VoterHistory::factory(5)->create([
                'stake_address' => $voter->stake_pub,
            ]);

            VoterHistory::factory(1)->create([
                'caster' => $voter->cat_id,
                'stake_address' => $voter->stake_pub,
            ]);
        });
    }
}