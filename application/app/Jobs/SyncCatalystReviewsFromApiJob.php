<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Http\Integrations\CatalystReviews\CatalystReviewsConnector;
use App\Http\Integrations\CatalystReviews\Requests\GetFilteredProposalReviewsRequest;
use App\Models\Discussion;
use App\Models\Proposal;
use App\Models\Rating;
use App\Models\Review;
use App\Models\Reviewer;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SyncCatalystReviewsFromApiJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 900; // 15 minutes

    /**
     * Mapping and templates (same as command)
     */
    protected const DISCUSSION_TEMPLATES = [
        'Impact' => [
            'title' => 'Impact',
            'comment_prompt' => 'Has this project clearly demonstrated in all aspects of the proposal that it will positively impact the cardano ecosystem?',
        ],
        'Feasibility' => [
            'title' => 'Feasibility',
            'comment_prompt' => 'Is this project feasible based on the proposal submitted? Does the plan and associated budget and milestones look achievable? Does the team have the skills, experience, capability and capacity to complete the project successfully?',
        ],
        'Value for Money' => [
            'title' => 'Value for Money',
            'comment_prompt' => 'Is the funding amount requested for this project reasonable and does it provide good Value for the Money to the Treasury?',
        ],
    ];

    protected const RATING_FIELD_MAP = [
        'impact_alignment_rating_given' => 'Impact',
        'feasibility_rating_given' => 'Feasibility',
        'auditability_rating_given' => 'Value for Money',
    ];

    protected const NOTE_FIELD_MAP = [
        'impact_alignment_note' => 'Impact',
        'feasibility_note' => 'Feasibility',
        'auditability_note' => 'Value for Money',
    ];

    public function __construct(
        protected string $fundId,
        protected int $pageSize = 50,
        protected int $startPage = 0,
        protected ?int $limit = null
    ) {}

    public function handle(): void
    {
        $processed = 0;
        $skipped = 0;
        $errors = 0;

        $connector = new CatalystReviewsConnector;
        $page = $this->startPage;
        $totalFetched = 0;

        do {
            try {
                $response = $connector->send(new GetFilteredProposalReviewsRequest($page, $this->pageSize));
                $data = $response->json();

                $reviews = $data['data'] ?? [];
                $pageInfo = $data['page'] ?? [];

                if (empty($reviews)) {
                    Log::info('SyncCatalystReviewsFromApiJob: No more reviews to fetch', ['page' => $page]);
                    break;
                }

                foreach ($reviews as $reviewData) {
                    if ($this->limit !== null && $totalFetched >= $this->limit) {
                        break 2; // exit both foreach and do-while
                    }

                    $totalFetched++;

                    try {
                        $ok = $this->processOneReview($reviewData, $this->fundId);
                        if ($ok) {
                            $processed++;
                        } else {
                            $skipped++;
                        }
                    } catch (\Throwable $e) {
                        $errors++;
                        Log::error('SyncCatalystReviewsFromApiJob: error processing review', [
                            'error' => $e->getMessage(),
                            'trace' => $e->getTraceAsString(),
                        ]);
                    }
                }

                // Determine if there are more pages
                $totalPages = isset($pageInfo['total']) ? (int) ceil($pageInfo['total'] / $this->pageSize) : 0;
                if ($totalPages > 0 && $page >= $totalPages - 1) {
                    break;
                }

                $page++;
            } catch (\Throwable $e) {
                Log::error('SyncCatalystReviewsFromApiJob: failed to fetch page', [
                    'page' => $page,
                    'error' => $e->getMessage(),
                ]);
                break;
            }
        } while (true);

        Log::info('SyncCatalystReviewsFromApiJob: completed', [
            'processed' => $processed,
            'skipped' => $skipped,
            'errors' => $errors,
            'fund_id' => $this->fundId,
            'limit' => $this->limit,
            'page_size' => $this->pageSize,
            'start_page' => $this->startPage,
        ]);
    }

    /**
     * Process a single review payload
     */
    protected function processOneReview(array $reviewData, string $fundId): bool
    {
        return DB::transaction(function () use ($reviewData, $fundId) {
            // 1. Reviewer
            $reviewer = $this->findOrCreateReviewer($reviewData['assessor'] ?? '');

            // 2. Proposal
            $proposal = $this->findProposal($reviewData, $fundId);
            if (! $proposal) {
                Log::warning('SyncCatalystReviewsFromApiJob: Proposal not found', [
                    'pr_id' => $reviewData['proposal']['pr_id'] ?? null,
                    'title' => $reviewData['proposal']['title'] ?? null,
                ]);

                return false; // skipped
            }

            // 2b. Store proposal.row_id as review_module_id meta
            $rowId = $reviewData['proposal']['row_id'] ?? null;
            if ($rowId !== null) {
                $proposal->saveMeta('review_module_id', (string) $rowId);
            }

            // 3. Ensure discussions
            $discussions = $this->ensureDiscussionsExist($proposal);

            // 4. Create review + rating per facet
            foreach (self::NOTE_FIELD_MAP as $noteField => $discussionTitle) {
                $ratingField = array_search($discussionTitle, self::RATING_FIELD_MAP, true);

                if (! isset($discussions[$discussionTitle])) {
                    continue;
                }

                $discussion = $discussions[$discussionTitle];
                $noteContent = $reviewData[$noteField] ?? null;
                $ratingValue = $ratingField ? ($reviewData[$ratingField] ?? null) : null;

                if ($noteContent === null && $ratingValue === null) {
                    continue;
                }

                $review = $this->createOrUpdateReview($discussion, $reviewer, $noteContent, $reviewData);

                if ($ratingValue !== null) {
                    $this->createOrUpdateRating($discussion, $review, (int) $ratingValue);
                }
            }

            return true;
        });
    }

    protected function findOrCreateReviewer(string $assessorId): Reviewer
    {
        $assessorId = trim($assessorId);
        $reviewer = Reviewer::where('catalyst_reviewer_id', $assessorId)->first();

        if (! $reviewer) {
            $reviewer = Reviewer::create([
                'catalyst_reviewer_id' => $assessorId,
            ]);
        }

        return $reviewer;
    }

    protected function findProposal(array $reviewData, string $fundId): ?Proposal
    {
        $prId = $reviewData['proposal']['pr_id'] ?? null;
        $title = $reviewData['proposal']['title'] ?? null;

        if ($prId) {
            $proposal = Proposal::whereHas('metas', function ($query) use ($prId) {
                $query->where('key', 'catalyst_document_id')
                    ->where('content', $prId);
            })->first();

            if ($proposal) {
                return $proposal;
            }
        }

        if ($title) {
            $normalizedTitle = preg_replace('/[^a-z0-9]/i', '', strtolower(trim($title)));

            // 1) Within fund
            $proposal = Proposal::where('fund_id', $fundId)
                ->where(function ($query) use ($title, $normalizedTitle) {
                    $query->whereRaw("title->>'en' = ?", [$title])
                        ->orWhereRaw("LOWER(title->>'en') ILIKE ?", ['%'.strtolower($title).'%'])
                        ->orWhereRaw(
                            "regexp_replace(LOWER(title->>'en'), '[^a-z0-9]', '', 'g') = ?",
                            [$normalizedTitle]
                        );
                })
                ->first();

            if ($proposal) {
                return $proposal;
            }

            // 2) Any fund (last resort)
            $proposal = Proposal::where(function ($query) use ($title, $normalizedTitle) {
                $query->whereRaw("title->>'en' = ?", [$title])
                    ->orWhereRaw("LOWER(title->>'en') ILIKE ?", ['%'.strtolower($title).'%'])
                    ->orWhereRaw(
                        "regexp_replace(LOWER(title->>'en'), '[^a-z0-9]', '', 'g') = ?",
                        [$normalizedTitle]
                    );
            })
                ->first();

            if ($proposal) {
                return $proposal;
            }
        }

        return null;
    }

    protected function ensureDiscussionsExist(Proposal $proposal): array
    {
        $discussions = [];

        foreach (self::DISCUSSION_TEMPLATES as $key => $template) {
            $discussion = Discussion::where('model_type', Proposal::class)
                ->where('model_id', $proposal->id)
                ->where('title', $template['title'])
                ->first();

            if (! $discussion) {
                $discussion = new Discussion;
                $discussion->model_type = Proposal::class;
                $discussion->model_id = $proposal->id;
                $discussion->title = $template['title'];
                $discussion->comment_prompt = $template['comment_prompt'];
                $discussion->status = 'published';
                $discussion->save();
            }

            $discussions[$template['title']] = $discussion;
        }

        return $discussions;
    }

    protected function createOrUpdateReview(
        Discussion $discussion,
        Reviewer $reviewer,
        ?string $content,
        array $reviewData
    ): Review {
        $status = ($reviewData['moderated'] ?? false) ? 'pending' : 'published';
        $createdAt = isset($reviewData['created_at'])
            ? Carbon::parse($reviewData['created_at'])
            : now();
        $updatedAt = isset($reviewData['updated_at'])
            ? Carbon::parse($reviewData['updated_at'])
            : now();

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

    protected function createOrUpdateRating(
        Discussion $discussion,
        Review $review,
        int $ratingValue
    ): Rating {
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
