<?php

namespace Database\Seeders;

use App\Models\Fund;
use App\Models\Reviewer;
use App\Models\ReviewerReputationScore;
use Faker\Factory;
use Illuminate\Database\Seeder;

class ReviewerReputationScoreSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //
        $faker = Factory::create();
        $reviewers = Reviewer::all();
        $funds = Fund::all();

        if ($reviewers->isEmpty()) {
            $reviewers = Reviewer::factory()->count(10)-create();
        }
        if ($funds->isEmpty()) {
            $funds = Fund::factory()->count(3)->create();
        }
        foreach ($reviewers as $reviewer) {
            ReviewerReputationScore::create([
                'reviewer_id' => $reviewer->id,
                'score' => $faker->numberBetween(50, 100),
                'context_type' => null,
                'context_id' => null,
            ]);
            foreach ($funds as $fund) {
                ReviewerReputationScore::create([
                    'reviewer_id' => $reviewer->id,
                    'score' => $faker->numberBetween(50, 100),
                    'context_type' => Fund::class,
                    'context_id' => $fund->id,
                ]);
            }
        }
    }
}
