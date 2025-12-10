<?php

declare(strict_types=1);

namespace App\Nova\Actions;

use App\Jobs\SyncDocumentPage;
use App\Models\Proposal;
use Illuminate\Bus\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Collection;
use Laravel\Nova\Actions\Action;
use Laravel\Nova\Actions\ActionResponse;
use Laravel\Nova\Fields\ActionFields;
use Laravel\Nova\Fields\Text;
use Laravel\Nova\Http\Requests\NovaRequest;

class SyncProposalFromCatalyst extends Action
{
    use InteractsWithQueue, Queueable;

    /**
     * The displayable name of the action.
     */
    public $name = 'Sync from Catalyst Gateway';

    /**
     * Perform the action on the given models.
     */
    public function handle(ActionFields $fields, Collection $models): ActionResponse
    {
        $successCount = 0;
        $errorCount = 0;

        foreach ($models as $proposal) {
            // Use provided values or fall back to proposal's existing values
            $documentId = $fields->catalyst_document_id ?: $proposal->catalyst_document_id;
            $fund = $fields->fund ?: $proposal->fund_id;

            if (! $documentId) {
                $errorCount++;

                continue; // Skip proposals without document ID
            }

            if (! $fund) {
                $errorCount++;

                continue; // Skip proposals without fund ID
            }

            // Create a document array in the format expected by SyncDocumentPage
            $docs = [
                [
                    'id' => $documentId,
                    'ver' => [null], // Version will be determined during fetch
                ],
            ];

            // Dispatch the sync job
            SyncDocumentPage::dispatch($docs, 1, 1, $fund);
            $successCount++;
        }

        if ($errorCount > 0) {
            return Action::message("Sync jobs queued for {$successCount} proposals. {$errorCount} proposals skipped (missing document ID or fund).");
        }

        return Action::message("Proposal sync jobs queued successfully for {$successCount} proposals!");
    }

    /**
     * Get the fields available on the action.
     */
    public function fields(NovaRequest $request): array
    {
        // Get the first selected proposal to prepopulate defaults
        $proposalId = $request->get('resources');
        $defaultDocumentId = null;
        $defaultFund = null;

        if ($proposalId && is_string($proposalId)) {
            $proposalIds = explode(',', $proposalId);
            if (count($proposalIds) > 0) {
                $proposal = \App\Models\Proposal::find($proposalIds[0]);
                $defaultDocumentId = $proposal?->catalyst_document_id;
                $defaultFund = $proposal?->fund_id;
            }
        }

        return [
            Text::make('Catalyst Document ID', 'catalyst_document_id')
                ->help('Enter the document ID from the Catalyst Gateway. Leave blank to use the proposal\'s existing document ID.')
                ->default($defaultDocumentId)
                ->nullable(),

            Text::make('Fund', 'fund')
                ->help('Enter the fund identifier (e.g., fund15, fund16). Leave blank to use the proposal\'s current fund ID.')
                ->default($defaultFund)
                ->nullable(),
        ];
    }
}
