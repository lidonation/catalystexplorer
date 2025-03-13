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
        $funds = Fund::all();
        if ($funds->isEmpty()) {
            foreach ($reviewers as $reviewer) {
                ReviewerReputationScore::factory()->create([
                    'reviewer_id' => $reviewer->id,
                    'context_type' => null,
                    'context_id' => null,
                ]);
            }
        } else {
            foreach ($reviewers as $reviewer) {
                ReviewerReputationScore::factory()->create([
                    'reviewer_id' => $reviewer->id,
                    'context_type' => null,
                    'context_id' => null,
                ]);

                foreach ($funds as $fund) {
                    ReviewerReputationScore::factory()->create([
                        'reviewer_id' => $reviewer->id,
                        'context_type' => Fund::class,
                        'context_id' => $fund->id,
                    ]);
                }
            }
        }
    }
}
