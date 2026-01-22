<?php

declare(strict_types=1);

namespace App\Actions\ReviewSync;

use App\Models\Discussion;
use App\Models\Rating;
use App\Models\Review;

class CreateOrUpdateRating
{
    public function __invoke(
        Discussion $discussion,
        Review $review,
        int $ratingValue
    ): Rating {
        // Check if rating already exists for this review
        $rating = Rating::where('review_id', $review->id)
            ->where('model_type', Discussion::class)
            ->where('model_id', $discussion->id)
            ->first();

        if ($rating) {
            $rating->rating = $ratingValue;
            $rating->save();
        } else {
            $rating = new Rating;
            $rating->model_type = Discussion::class;
            $rating->model_id = $discussion->id;
            $rating->review_id = $review->id;
            $rating->rating = $ratingValue;
            $rating->status = 'published';
            $rating->save();
        }

        return $rating;
    }
}
