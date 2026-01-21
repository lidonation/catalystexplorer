<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Actions\ReviewSync\ProcessReviewData;
use App\Http\Integrations\CatalystReviews\CatalystReviewsConnector;
use App\Http\Integrations\CatalystReviews\Requests\GetFilteredProposalReviewsRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SyncCatalystReviewsFromApiJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 900;

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
                        $processReviewData = app(ProcessReviewData::class);
                        $ok = $processReviewData($reviewData, $this->fundId);
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
}
