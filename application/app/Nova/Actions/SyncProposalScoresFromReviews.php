<?php

declare(strict_types=1);

namespace App\Nova\Actions;

use App\Jobs\SyncProposalScoresFromReviewsApi as SyncScoresJob;
use App\Models\Proposal;
use Illuminate\Bus\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Collection;
use Laravel\Nova\Actions\Action;
use Laravel\Nova\Actions\ActionResponse;
use Laravel\Nova\Fields\ActionFields;
use Laravel\Nova\Fields\Text;

class SyncProposalScoresFromReviews extends Action
{
    use InteractsWithQueue, Queueable;

    /**
     * The displayable name of the action.
     */
    public $name = 'Sync Review Scores';

    /**
     * The text to be used for the action's confirm button.
     */
    public $confirmButtonText = 'Sync Scores';

    /**
     * The text to be used for the action's confirmation text.
     */
    public $confirmText = 'This will fetch and update proposal review scores from the Reviews API.';

    /**
     * Perform the action on the given models.
     */
    public function handle(ActionFields $fields, Collection $models): ActionResponse|Action
    {
        $successCount = 0;
        $errorCount = 0;

        foreach ($models as $proposal) {
            if (! $proposal instanceof Proposal) {
                $errorCount++;

                continue;
            }

            $reviewModuleId = $proposal?->meta_info?->review_module_id;

            if (! $reviewModuleId) {
                $errorCount++;

                continue;
            }

            SyncScoresJob::dispatch($proposal->id, (int) $reviewModuleId);
            $successCount++;
        }

        if ($errorCount > 0) {
            return Action::danger('Sync Failtures', "Sync jobs queued for {$successCount} proposals. {$errorCount} proposals skipped (missing review_module_id).");
        }

        return Action::message("Proposal score sync jobs queued successfully for {$successCount} proposals!");
    }
}
