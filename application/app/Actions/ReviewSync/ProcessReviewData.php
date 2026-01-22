<?php

declare(strict_types=1);

namespace App\Actions\ReviewSync;

use App\Models\Review;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ProcessReviewData
{
    public function __construct(
        protected FindOrCreateReviewer $findOrCreateReviewer,
        protected FindProposal $findProposal,
        protected EnsureDiscussionsExist $ensureDiscussionsExist,
        protected CreateOrUpdateReview $createOrUpdateReview,
        protected CreateOrUpdateRating $createOrUpdateRating,
    ) {}

    public function __invoke(array $reviewData, string $fundId): bool
    {
        return Review::withoutSyncingToSearch(function () use ($reviewData, $fundId) {
            return DB::transaction(function () use ($reviewData, $fundId) {
                // 1. Find or create the reviewer
                $reviewer = ($this->findOrCreateReviewer)($reviewData['assessor'] ?? '');

                // 2. Find the proposal
                $proposal = ($this->findProposal)($reviewData, $fundId);

                if (! $proposal) {
                    Log::warning('ProcessReviewData: Proposal not found', [
                        'pr_id' => $reviewData['proposal']['pr_id'] ?? null,
                        'title' => $reviewData['proposal']['title'] ?? null,
                    ]);

                    return false; // skipped
                }

                // 2b. Store proposal.proposal_id as review_module_id meta
                $rowId = $reviewData['proposal']['proposal_id'] ?? $reviewData['proposal_id'] ?? null;
                if ($rowId !== null) {
                    $proposal->saveMeta('review_module_id', (string) $rowId);
                }

                // 3. Ensure discussions exist for the proposal
                $discussions = ($this->ensureDiscussionsExist)($proposal);

                // 4. Create reviews and ratings for each discussion type
                foreach (ReviewSyncConstants::NOTE_FIELD_MAP as $noteField => $discussionTitle) {
                    $ratingField = array_search($discussionTitle, ReviewSyncConstants::RATING_FIELD_MAP, true);

                    if (! isset($discussions[$discussionTitle])) {
                        continue;
                    }

                    $discussion = $discussions[$discussionTitle];
                    $noteContent = $reviewData[$noteField] ?? null;
                    $ratingValue = $ratingField ? ($reviewData[$ratingField] ?? null) : null;

                    if ($noteContent === null && $ratingValue === null) {
                        continue;
                    }

                    // Create or update the review
                    $review = ($this->createOrUpdateReview)(
                        $discussion,
                        $reviewer,
                        $noteContent,
                        $reviewData
                    );

                    // Create or update the rating
                    if ($ratingValue !== null) {
                        ($this->createOrUpdateRating)($discussion, $review, (int) $ratingValue);
                    }
                }

                return true;
            });
        });
    }
}
