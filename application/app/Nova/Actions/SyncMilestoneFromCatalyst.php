<?php

declare(strict_types=1);

namespace App\Nova\Actions;

use App\Jobs\SyncProjectSchedulesFromCatalystJob;
use App\Models\Proposal;
use Illuminate\Bus\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Collection;
use Laravel\Nova\Actions\Action;
use Laravel\Nova\Actions\ActionResponse;
use Laravel\Nova\Fields\ActionFields;
use Laravel\Nova\Http\Requests\NovaRequest;

class SyncMilestoneFromCatalyst extends Action
{
    use InteractsWithQueue, Queueable;

    /**
     * The displayable name of the action.
     */
    public $name = 'Sync Milestones from Catalyst';

    /**
     * Perform the action on the given models.
     */
    public function handle(ActionFields $fields, Collection $models): ActionResponse
    {
        $successCount = 0;
        $noScheduleCount = 0;

        foreach ($models as $proposal) {
            /** @var Proposal $proposal */
            $schedule = $proposal->schedule;

            if (! $schedule) {
                $noScheduleCount++;

                continue; // Skip proposals without a project schedule
            }

            // Prepare the project schedule data array for the job
            $projectScheduleData = [
                'id' => $schedule->api_proposal_id ?? $schedule->project_id, // API's proposal ID for fetching milestones
                'project_id' => $schedule->project_id,
                'title' => $schedule->title,
                'proposal_id' => $schedule->proposal_id,
                'fund_id' => $schedule->fund_id,
                'milestone_count' => $schedule->milestone_count,
                'status' => $schedule->status,
                'funds_distributed' => $schedule->funds_distributed ?? 0,
                'project_schedule_id' => $schedule->id, // UUID for database operations
                'api_proposal_id' => $schedule->api_proposal_id, // API's proposal ID for milestone fetching
            ];

            // Dispatch the sync job
            SyncProjectSchedulesFromCatalystJob::dispatch($projectScheduleData);
            $successCount++;
        }

        if ($noScheduleCount > 0) {
            return Action::message("Milestone sync jobs queued for {$successCount} proposals. {$noScheduleCount} proposals skipped (no project schedule found).");
        }

        return Action::message("Milestone sync jobs queued successfully for {$successCount} proposals!");
    }

    /**
     * Get the fields available on the action.
     */
    public function fields(NovaRequest $request): array
    {
        return [];
    }
}
