<?php

declare(strict_types=1);

namespace App\Nova\Actions;

use App\Jobs\SyncNftWithNMKRJob;
use Illuminate\Bus\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Collection;
use Laravel\Nova\Actions\Action;
use Laravel\Nova\Actions\ActionResponse;
use Laravel\Nova\Fields\ActionFields;
use Laravel\Nova\Fields\Boolean;
use Laravel\Nova\Fields\Text;
use Laravel\Nova\Http\Requests\NovaRequest;

class SyncNftWithNMKR extends Action
{
    use InteractsWithQueue, Queueable;

    /**
     * Perform the action on the given models.
     */
    public function handle(ActionFields $fields, Collection $models): ActionResponse
    {
        $projectUid = $fields->nmkr_project_uid;
        $forceUpdate = $fields->force_update;

        foreach ($models as $nft) {
            if ($forceUpdate) {
                SyncNftWithNMKRJob::dispatch($nft, $projectUid, null, true);
            } else {
                SyncNftWithNMKRJob::dispatch($nft, $projectUid);
            }
        }

        return Action::message('NFT synchronization successful!');
    }

    /**
     * Get the fields available on the action.
     */
    public function fields(NovaRequest $request): array
    {
        return [
            Text::make('NMKR Project UID', 'nmkr_project_uid'),
            Boolean::make('Force Update', 'force_update')
                ->help('Check this box to force update this NFT')
                ->default(false),
        ];
    }
}
