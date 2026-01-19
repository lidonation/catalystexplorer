<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Http\Integrations\CatalystGateway\CatalystGatewayConnector;
use App\Http\Integrations\CatalystGateway\Requests\GetDocumentIndexRequest;
use App\Jobs\SyncDocumentPage;
use App\Models\Proposal;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class SyncProposalsFromCatalyst extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'proposals:sync-from-catalyst
                            {--document-id= : Specific document ID to sync}
                            {--fund= : Fund identifier (will use proposal fund_id if not provided)}
                            {--proposal-id= : Specific proposal ID to sync (uses its catalyst_document_id and fund_id)}
                            {--batch-size=10 : Number of documents to process per batch}
                            {--limit= : Maximum number of documents to process}';

    /**
     * The console command description.
     */
    protected $description = 'Sync proposal details from the Catalyst API Gateway';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $documentId = $this->option('document-id');
        $fund = $this->option('fund');
        $proposalId = $this->option('proposal-id');
        $batchSize = (int) $this->option('batch-size');
        $limit = $this->option('limit') ? (int) $this->option('limit') : null;

        if ($proposalId) {
            $this->info("Syncing proposal: {$proposalId}");
            $this->syncProposal($proposalId, $documentId, $fund);
        } elseif ($documentId) {
            $this->info("Syncing single document: {$documentId}");
            $this->syncSingleDocument($documentId, $fund ?: 'fund15');
        } else {
            $this->info('Starting batch sync from Catalyst Gateway for fund: '.($fund ?: 'fund15'));
            $this->syncBatchDocuments($fund ?: 'fund15', $batchSize, $limit);
        }

        return Command::SUCCESS;
    }

    private function syncSingleDocument(string $documentId, string $fund): void
    {
        $docs = [
            [
                'id' => $documentId,
                'ver' => [null], // Version will be determined during fetch
            ],
        ];

        $this->info("Dispatching sync job for document: {$documentId}");
        SyncDocumentPage::dispatch($docs, 1, 1, $fund);

        $this->info("✅ Sync job queued successfully for document: {$documentId}");
    }

    private function syncProposal(string $proposalId, ?string $documentId = null, ?string $fund = null): void
    {
        $proposal = Proposal::find($proposalId);

        if (! $proposal) {
            $this->error("❌ Proposal not found: {$proposalId}");

            return;
        }

        // Use provided values or fall back to proposal's existing values
        $finalDocumentId = $documentId ?: $proposal->catalyst_document_id;
        $finalFund = $fund ?: $proposal->fund_id;

        if (! $finalDocumentId) {
            $this->error("❌ No document ID available for proposal {$proposalId}");

            return;
        }

        if (! $finalFund) {
            $this->error("❌ No fund ID available for proposal {$proposalId}");

            return;
        }

        $this->info("Using document ID: {$finalDocumentId}");
        $this->info("Using fund ID: {$finalFund}");

        $this->syncSingleDocument($finalDocumentId, $finalFund);
    }

    private function syncBatchDocuments(string $fund, int $batchSize, ?int $limit): void
    {
        $this->info("Starting batch sync for fund: {$fund}");

        $page = 0;
        $limitPerPage = $batchSize;
        $connector = new CatalystGatewayConnector;
        $totalProcessed = 0;
        $maxRetries = 3;
        $filters = ['type' => '7808d2ba-d511-40af-84e8-c0d1625fdfdc'];

        do {
            $this->info("Fetching page {$page} (limit: {$limitPerPage})...");

            $retryCount = 0;
            $success = false;
            $body = null;
            $remaining = 0;

            while (! $success && $retryCount < $maxRetries) {
                try {
                    // Use V1 mode by passing version='v1' and page parameter
                    $request = new GetDocumentIndexRequest(
                        filters: $filters,
                        limit: $limitPerPage,
                        offset: 0, // Ignored in V1
                        page: $page,
                        version: 'v1'
                    );
                    $response = $connector->send($request);

                    if ($response->failed()) {
                        throw $response->toException();
                    }

                    $body = $response->json();
                    $success = true;
                } catch (\Exception $e) {
                    $retryCount++;
                    $this->warn("Attempt {$retryCount} failed for page {$page}: ".$e->getMessage());

                    if ($retryCount >= $maxRetries) {
                        Log::error("Failed to fetch page {$page} after {$maxRetries} attempts.", ['exception' => $e]);
                        $this->error("Failed to fetch page {$page}. Aborting batch sync.");

                        return;
                    }
                    sleep(2 * $retryCount);
                }
            }

            $docs = $body['docs'] ?? [];
            $remaining = $body['page']['remaining'] ?? 0;

            if (empty($docs)) {
                $this->info("No documents found on page {$page}.");
                break;
            }

            $docCount = count($docs);
            $this->info("Dispatching {$docCount} documents from page {$page}");

            SyncDocumentPage::dispatch($docs, $page, $limitPerPage, $fund);

            $totalProcessed += $docCount;
            $page++;

            if ($limit && $totalProcessed >= $limit) {
                $this->info("Reached limit of {$limit} documents.");
                break;
            }
        } while ($remaining > 0);

        $this->info("Batch sync dispatched for {$totalProcessed} documents.");
    }
}
