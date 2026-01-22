<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Actions\ReviewSync\ProcessReviewData;
use App\Http\Integrations\CatalystReviews\CatalystReviewsConnector;
use App\Http\Integrations\CatalystReviews\Requests\GetFilteredProposalReviewsRequest;
use App\Jobs\SyncCatalystReviewsFromApiJob;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class SyncReviewsFromCatalyst extends Command
{
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
            $this->info('Running in ASYNC mode (dispatching API fetch + processing to queue)...');

            SyncCatalystReviewsFromApiJob::dispatch(
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
                $processReviewData = app(ProcessReviewData::class);
                $ok = $processReviewData($reviewData, $fundId);
                if ($ok) {
                    $this->processedCount++;
                } else {
                    $this->skippedCount++;
                }
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
}
