<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Review;
use App\Models\ReviewModeration;
use Illuminate\Database\Seeder;

class ReviewSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create a review
        Review::factory()->create()->each(
            function ($review) {
                $reviewModeration = ReviewModeration::factory()->create();

                $reviewModeration->reviews()->attach($reviewModeration->reviewer_id, [
                    'review_id' => $review->id,
                    'reviewer_id' => $reviewModeration->reviewer_id,
                ]);
            }
        );
    }
}
