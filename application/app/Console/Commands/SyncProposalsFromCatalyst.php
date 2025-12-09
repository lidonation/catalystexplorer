<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Jobs\SyncDocumentPage;
use App\Models\Proposal;
use Illuminate\Console\Command;

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
        $this->warn('Batch sync functionality requires document discovery implementation.');
        $this->info('For now, use --document-id to sync specific documents.');

        // TODO: Implement document discovery via Catalyst Gateway API
        // This would involve:
        // 1. Querying the gateway index for documents by fund
        // 2. Paginating through results
        // 3. Batching documents for processing
        // 4. Dispatching SyncDocumentPage jobs

        $this->info('Example usage:');
        $this->line('  php artisan proposals:sync-from-catalyst --proposal-id=12345678-1234-1234-1234-123456789abc');
        $this->line('  php artisan proposals:sync-from-catalyst --document-id=abc123 --fund=fund15');
        $this->line('  php artisan proposals:sync-from-catalyst --proposal-id=12345678-1234-1234-1234-123456789abc --document-id=def456');
    }
}
