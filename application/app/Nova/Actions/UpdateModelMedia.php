<?php

declare(strict_types=1);

namespace App\Nova\Actions;

use App\Jobs\UpdateModelMediaJob;
use Illuminate\Bus\Batchable;
use Illuminate\Bus\PendingBatch;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Collection;
use Laravel\Nova\Actions\Action;
use Laravel\Nova\Fields\ActionFields;
use Laravel\Nova\Fields\Text;
use Laravel\Nova\Http\Requests\NovaRequest;

class UpdateModelMedia extends Action implements ShouldQueue
{
    use Batchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    /**
     * Perform the action on the given models.
     *
     * @return mixed
     */
    public function handle(ActionFields $fields, Collection $models)
    {
        $collectionName = $fields->get('collectionName') ?? 'hero';

        $models->each(function ($m) use ($collectionName) {
            UpdateModelMediaJob::dispatch($m, $collectionName);
        });
    }

    /**
     * Get the fields available on the action.
     *
     * @return array<int, \Laravel\Nova\Fields\Field>
     */
    public function fields(NovaRequest $request): array
    {
        return [
            Text::make('Collection Name', 'collectionName'),
        ];
    }

    /**
     * Register `then`, `catch` and `finally` event on batchable job.
     */
    public function withBatch(ActionFields $fields, PendingBatch $batch): void
    {
        //
    }
}
