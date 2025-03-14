<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Fund;
use App\Models\Reviewer;
use App\Models\ReviewerReputationScore;
use Illuminate\Database\Seeder;

class ReviewerReputationScoreSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //
        $reviewers = Reviewer::all();
        $funds = Fund::all()->isEmpty()
            ? Fund::factory()->count(3)->create()
            : Fund::all();
        $funds->each(function ($fund) use ($reviewers) {
            $selectedReviewers = $reviewers->random(
                fake()->numberBetween(5, min(20, $reviewers->count()))
            );

            $selectedReviewers->each(function ($reviewer) use ($fund) {
                ReviewerReputationScore::factory()
                    ->for($reviewer)
                    ->state([
                        'context_type' => Fund::class,
                        'context_id' => $fund->id,
                    ])
                    ->create();
            });
        });

        $reviewers->random(min($reviewers->count(), 30))->each(function ($reviewer) {
            ReviewerReputationScore::factory()
                ->for($reviewer)
                ->state([
                    'context_type' => null,
                    'context_id' => null,
                ])
                ->create();
        });
    }
}
