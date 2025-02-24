<?php

namespace Database\Seeders;

use App\Models\Discussion;
use App\Models\Moderation;
use App\Models\Moderator;
use App\Models\Proposal;
use App\Models\Rating;
use App\Models\Review;
use App\Models\Reviewer;
use Illuminate\Database\Seeder;

class ModerationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $reviewers = Reviewer::factory()->count(1500)->create();
        $moderaters = Moderator::factory()->count(1000)->create();

        Proposal::get()->each(function ($proposal) use ($reviewers, $moderaters) {

            $reviews = Review::factory()->count(3)->create()->pluck('id');

            Moderation::factory()
                ->count(3)
                ->sequence(fn ($seq) => [
                    'review_id' => $reviews->toArray()[$seq->index],
                ])
                ->recycle($reviewers->random())
                ->state(fn () => [
                    'moderator_id' => $moderaters->random()->id,
                    'rationale' => fake()->sentence(),
                    'valid' => fake()->boolean(),
                    'context_type' => Proposal::class,
                    'context_id' => $proposal->id,
                    'deleted_at' => null,
                ])
                ->create();

            Discussion::factory(3)
                ->sequence(
                    ['title' => 'Impact Alignment'],
                    ['title' => 'Feasibility'],
                    ['title' => 'Value for money'],
                )
                ->has(Rating::factory()->sequence(fn ($seq) => [
                    'review_id' => $reviews->toArray()[$seq->index],
                ]))
                ->state([
                    'model_type' => Proposal::class,
                    'model_id' => $proposal->id,
                ])->create();
        });
    }
}
