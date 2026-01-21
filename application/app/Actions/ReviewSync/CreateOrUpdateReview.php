<?php

declare(strict_types=1);

namespace App\Actions\ReviewSync;

use App\Models\Discussion;
use App\Models\Review;
use App\Models\Reviewer;
use Carbon\Carbon;

class CreateOrUpdateReview
{
    public function __invoke(
        Discussion $discussion,
        Reviewer $reviewer,
        ?string $content,
        array $reviewData
    ): Review {
        // Use 'pending' for moderated reviews (needs further action), 'published' for approved
        $status = ($reviewData['moderated'] ?? false) ? 'pending' : 'published';
        $createdAt = isset($reviewData['created_at'])
            ? Carbon::parse($reviewData['created_at'])
            : now();
        $updatedAt = isset($reviewData['updated_at'])
            ? Carbon::parse($reviewData['updated_at'])
            : now();

        // Check if review already exists for this discussion + reviewer
        $review = Review::where('model_type', Discussion::class)
            ->where('model_id', $discussion->id)
            ->where('reviewer_id', $reviewer->id)
            ->first();

        if ($review) {
            $review->content = $content ?? '';
            $review->status = $status;
            $review->updated_at = $updatedAt;
            $review->save();
        } else {
            $review = Review::create([
                'model_type' => Discussion::class,
                'model_id' => $discussion->id,
                'reviewer_id' => $reviewer->id,
                'content' => $content ?? '',
                'status' => $status,
                'created_at' => $createdAt,
                'updated_at' => $updatedAt,
            ]);
        }

        return $review;
    }
}
