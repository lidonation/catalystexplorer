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
        $fundsCount = Fund::count();
        if ($fundsCount === 0) {
            Fund::factory()->count(3)->create();
        }

        $reviewersCount = Reviewer::count();
        if ($reviewersCount === 0) {
            Reviewer::factory()->count(20)->create();
        }
        Reviewer::all()->each(function ($reviewer) {
            $fundsToAttach = Fund::inRandomOrder()
                ->take(fake()->numberBetween(1, min(3, Fund::count())))
                ->get();

            $fundsToAttach->each(function ($fund) use ($reviewer) {
                ReviewerReputationScore::factory()
                    ->forReviewer($reviewer)
                    ->forFund($fund)
                    ->create();
            });
            if (fake()->boolean(50)) {
                ReviewerReputationScore::factory()
                    ->forReviewer($reviewer)
                    ->withoutContext()
                    ->create();
            }
        });
    }
}
