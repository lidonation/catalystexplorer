<?php

namespace Database\Seeders;

use App\Models\Registration;
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
        // create voter with registrations
        Voter::factory(50)
            ->has(
                Registration::factory()
                    ->count(3)
                    ->state(function (array $attributes, Voter $voter) {
                        return ['stake_pub' => $voter->stake_pub];
                    })
            )->create();

        // for each voter create history with one as a casted
        Voter::all()->each(function ($voter) {
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
