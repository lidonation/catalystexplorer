<?php

declare(strict_types=1);

namespace App\Nova\Actions;

use Illuminate\Bus\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Collection;
use Laravel\Nova\Actions\Action;
use Laravel\Nova\Actions\ActionResponse;
use Laravel\Nova\Fields\ActionFields;
use Laravel\Nova\Http\Requests\NovaRequest;

class RemoveFromSearchIndex extends Action
{
    use InteractsWithQueue, Queueable;

    /**
     * The displayable name of the action.
     *
     * @var string
     */
    public $name = 'Remove from Search Index';

    /**
     * Perform the action on the given models.
     */
    public function handle(ActionFields $fields, Collection $models): Action|ActionResponse|array
    {
        $successCount = 0;
        $errorCount = 0;
        $errors = [];

        foreach ($models as $model) {
            try {
                // Use Scout's unsearchable method to remove from index
                $model->unsearchable();
                $successCount++;
            } catch (\Exception $e) {
                $errorCount++;
                $errors[] = "Failed to remove {$model->id}: {$e->getMessage()}";
            }
        }

        if ($errorCount > 0) {
            return Action::danger(
                "Removed {$successCount} model(s) from search index. {$errorCount} failed. Errors: ".implode(', ', $errors)
            );
        }

        return Action::message("Successfully removed {$successCount} model(s) from search index.");
    }

    /**
     * Get the fields available on the action.
     */
    public function fields(NovaRequest $request): array
    {
        return [];
    }
}
