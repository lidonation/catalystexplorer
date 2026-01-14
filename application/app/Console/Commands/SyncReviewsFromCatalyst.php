<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Http\Integrations\CatalystReviews\CatalystReviewsConnector;
use App\Http\Integrations\CatalystReviews\Requests\GetFilteredProposalReviewsRequest;
use App\Models\Discussion;
use App\Models\Proposal;
use App\Models\Rating;
use App\Models\Review;
use App\Models\Reviewer;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SyncReviewsFromCatalyst extends Command
{
    /**
     * Discussion templates for proposal reviews
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

    /**
     * Mapping from API fields to discussion titles
     */
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

    // Legacy counters retained for sync-mode output only
    protected array $catalystReviews = [];

    protected int $processedCount = 0;

    protected int $skippedCount = 0;

    protected int $errorCount = 0;

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'sync:reviews
                            {fund_id : The fund ID to associate reviews with}
                            {--sync : Run synchronously instead of dispatching to queue}
                            {--limit= : Limit the number of reviews to process}
                            {--page-size=50 : Number of reviews per API page}
                            {--start-page=0 : Starting page number for pagination}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync proposal reviews from Catalyst Reviews API';

    public function handle(): int
    {
        $fundId = $this->argument('fund_id');
        $syncMode = $this->option('sync');
        $limit = $this->option('limit') ? (int) $this->option('limit') : null;
        $pageSize = (int) $this->option('page-size');
        $startPage = (int) $this->option('start-page');

        $this->info("Starting review sync for fund: {$fundId}");
        if ($syncMode) {
            // SYNC MODE: run in-process (legacy behavior)
            $this->info('Running in SYNC mode...');
            $this->info('Fetching reviews from Catalyst Reviews API...');

            $this->fetchAllReviews($pageSize, $startPage, $limit);

            if (empty($this->catalystReviews)) {
                $this->warn('No reviews found from API.');

                return Command::SUCCESS;
            }

            $count = count($this->catalystReviews);
            $this->info("Found {$count} review(s) to process.");
            $this->processSynchronously($fundId);

            $this->newLine();
            $this->info('Review sync completed.');
            $this->info("Processed: {$this->processedCount}, Skipped: {$this->skippedCount}, Errors: {$this->errorCount}");
        } else {
            // ASYNC MODE: dispatch a job that will perform API pagination and processing in the queue
            $this->info('Running in ASYNC mode (dispatching API fetch + processing to queue)...');

            \App\Jobs\SyncCatalystReviewsFromApiJob::dispatch(
                fundId: $fundId,
                pageSize: $pageSize,
                startPage: $startPage,
                limit: $limit
            );

            $this->info('Queued job: SyncCatalystReviewsFromApiJob');
            $this->info('Monitor progress with: tail -f storage/logs/laravel.log');
        }

        return Command::SUCCESS;
    }

    protected function fetchAllReviews(int $pageSize, int $startPage, ?int $limit): void
    {
        $connector = new CatalystReviewsConnector;
        $page = $startPage;
        $totalFetched = 0;

        do {
            $this->output->write("Fetching page {$page}... ");

            try {
                $response = $connector->send(new GetFilteredProposalReviewsRequest($page, $pageSize));
                $data = $response->json();

                $reviews = $data['data'] ?? [];
                $pageInfo = $data['page'] ?? [];

                if (empty($reviews)) {
                    $this->info('No more reviews.');
                    break;
                }

                $this->catalystReviews = array_merge($this->catalystReviews, $reviews);
                $totalFetched += count($reviews);

                $this->info(count($reviews).' reviews fetched (total: '.$totalFetched.')');

                // Check if we've hit the limit
                if ($limit !== null && $totalFetched >= $limit) {
                    $this->catalystReviews = array_slice($this->catalystReviews, 0, $limit);
                    $this->info("Limit of {$limit} reached.");
                    break;
                }

                // Check if we've reached the end
                $totalPages = isset($pageInfo['total']) ? ceil($pageInfo['total'] / $pageSize) : 0;
                if ($page >= $totalPages - 1) {
                    break;
                }

                $page++;
            } catch (\Exception $e) {
                $this->error('Failed to fetch page '.$page.': '.$e->getMessage());
                Log::error('SyncReviewsFromCatalyst: Failed to fetch reviews', [
                    'page' => $page,
                    'error' => $e->getMessage(),
                ]);
                break;
            }
        } while (true);
    }

    protected function processSynchronously(string $fundId): void
    {
        $bar = $this->output->createProgressBar(count($this->catalystReviews));
        $bar->start();

        foreach ($this->catalystReviews as $reviewData) {
            try {
                $this->processReview($reviewData, $fundId);
                $this->processedCount++;
            } catch (\Exception $e) {
                $this->errorCount++;
                Log::error('SyncReviewsFromCatalyst: Error processing review', [
                    'review_data' => $reviewData,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                ]);
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
    }

    protected function processAsynchronously(string $fundId): void
    {
        // For async mode, we'd dispatch jobs. For now, we'll process synchronously
        // but this could be refactored to use a job class
        $this->processSynchronously($fundId);
    }

    protected function processReview(array $reviewData, string $fundId): void
    {
        DB::beginTransaction();

        try {
            // 1. Find or create the reviewer
            $reviewer = $this->findOrCreateReviewer($reviewData['assessor']);

            // 2. Find the proposal
            $proposal = $this->findProposal($reviewData, $fundId);

            if (! $proposal) {
                $this->skippedCount++;
                $this->processedCount--;
                Log::warning('SyncReviewsFromCatalyst: Proposal not found', [
                    'pr_id' => $reviewData['proposal']['pr_id'] ?? null,
                    'title' => $reviewData['proposal']['title'] ?? null,
                ]);
                DB::rollBack();

                return;
            }

            // 2b. Store proposal.row_id as review_module_id meta
            $rowId = $reviewData['proposal']['row_id'] ?? null;
            if ($rowId !== null) {
                $proposal->saveMeta('review_module_id', (string) $rowId);
            }

            // 3. Ensure discussions exist for the proposal
            $discussions = $this->ensureDiscussionsExist($proposal);

            // 4. Create reviews and ratings for each discussion type
            foreach (self::NOTE_FIELD_MAP as $noteField => $discussionTitle) {
                $ratingField = array_search($discussionTitle, self::RATING_FIELD_MAP);

                if (! isset($discussions[$discussionTitle])) {
                    continue;
                }

                $discussion = $discussions[$discussionTitle];
                $noteContent = $reviewData[$noteField] ?? null;
                $ratingValue = $reviewData[$ratingField] ?? null;

                if ($noteContent === null && $ratingValue === null) {
                    continue;
                }

                // Create or update the review
                $review = $this->createOrUpdateReview(
                    $discussion,
                    $reviewer,
                    $noteContent,
                    $reviewData
                );

                // Create or update the rating
                if ($ratingValue !== null) {
                    $this->createOrUpdateRating($discussion, $review, $ratingValue);
                }
            }

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    protected function findOrCreateReviewer(string $assessorId): Reviewer
    {
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

        // First, try to find by catalyst_document_id in meta_info
        if ($prId) {
            $proposal = Proposal::whereHas('metas', function ($query) use ($prId) {
                $query->where('key', 'catalyst_document_id')
                    ->where('content', $prId);
            })->first();

            if ($proposal) {
                return $proposal;
            }
        }

        // Fallback: Find by title and fund_id
        // Title is stored as JSON, so we need to search within the JSON structure
        if ($title) {
            // Normalize the search title for fuzzy matching
            $normalizedTitle = preg_replace('/[^a-z0-9]/i', '', strtolower(trim($title)));

            // 1) Try within the given fund
            $proposal = Proposal::where('fund_id', $fundId)
                ->where(function ($query) use ($title, $normalizedTitle) {
                    // Exact match on JSON 'en'
                    $query->whereRaw("title->>'en' = ?", [$title])
                        // Case-insensitive contains
                        ->orWhereRaw("LOWER(title->>'en') ILIKE ?", ['%'.strtolower($title).'%'])
                        // Normalized equality (remove punctuation/whitespace)
                        ->orWhereRaw(
                            "regexp_replace(LOWER(title->>'en'), '[^a-z0-9]', '', 'g') = ?",
                            [$normalizedTitle]
                        );
                })
                ->first();

            if ($proposal) {
                return $proposal;
            }

            // 2) Broaden search across all funds (in case the provided fund_id doesn't match)
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
                // Avoid mass-assignment by setting attributes explicitly
                $discussion = new Discussion;
                $discussion->model_type = Proposal::class;
                $discussion->model_id = $proposal->id;
                $discussion->title = $template['title'];
                $discussion->comment_prompt = $template['comment_prompt'];
                $discussion->status = 'published';
                $discussion->save();
            }

            $discussions[$key] = $discussion;
        }

        return $discussions;
    }

    protected function createOrUpdateReview(
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
            $review->update([
                'content' => $content ?? '',
                'status' => $status,
                'updated_at' => $updatedAt,
            ]);
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
        // Check if rating already exists for this review
        $rating = Rating::where('review_id', $review->id)
            ->where('model_type', Discussion::class)
            ->where('model_id', $discussion->id)
            ->first();

        if ($rating) {
            $rating->rating = $ratingValue;
            $rating->save();
        } else {
            // Avoid mass-assignment by setting attributes explicitly
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
