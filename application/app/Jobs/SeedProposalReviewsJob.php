<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\Discussion;
use App\Models\Proposal;
use App\Models\Review;
use App\Models\ReviewModeration;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SeedProposalReviewsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public array $proposalIds;

    public function __construct(array $proposalIds)
    {
        $this->proposalIds = $proposalIds;
    }

    public function handle(): void
    {
        Proposal::whereIn('id', $this->proposalIds)->get()->each(function ($proposal) {
            $discussion = Discussion::factory()->create([
                'model_id' => $proposal->id,
                'model_type' => Proposal::class,
            ]);

            Review::factory(fake()->randomElement([8, 15, 20]))->create([
                'model_id' => $discussion->id,
            ])->each(function ($review) {
                $reviewModeration = ReviewModeration::factory()->create();

                $reviewModeration->reviews()->attach($review->id, [
                    'review_id' => $review->id,
                    'reviewer_id' => $reviewModeration->reviewer_id,
                ]);
            });
        });
    }
}
