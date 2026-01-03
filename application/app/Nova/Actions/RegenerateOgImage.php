<?php

declare(strict_types=1);

namespace App\Nova\Actions;

use App\Jobs\GenerateProposalOgImage;
use Illuminate\Bus\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;
use Laravel\Nova\Actions\Action;
use Laravel\Nova\Fields\ActionFields;
use Laravel\Nova\Http\Requests\NovaRequest;

class RegenerateOgImage extends Action
{
    use InteractsWithQueue, Queueable;

    /**
     * The displayable name of the action.
     *
     * @var string
     */
    public $name = 'Regenerate OG Image';

    /**
     * Perform the action on the given models.
     */
    public function handle(ActionFields $fields, Collection $models)
    {
        $disk = Storage::disk();
        $queuedCount = 0;
        $failedCount = 0;

        foreach ($models as $proposal) {
            $imagePath = "og-images/{$proposal->slug}.png";

            try {
                // Delete existing cached image if it exists
                if ($disk->exists($imagePath)) {
                    $disk->delete($imagePath);
                }

                // Dispatch job to generate new image in background
                GenerateProposalOgImage::dispatch($proposal->slug);
                $queuedCount++;
            } catch (\Exception $e) {
                $failedCount++;
                \Log::error('Failed to queue OG image regeneration', [
                    'proposal_id' => $proposal->id,
                    'slug' => $proposal->slug,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        if ($failedCount > 0) {
            return Action::danger("Queued {$queuedCount} OG image(s) for regeneration, but {$failedCount} failed. Check logs for details.");
        }

        return Action::message("Successfully queued {$queuedCount} OG image(s) for regeneration. Images will be generated in the background.");
    }

    /**
     * Get the fields available on the action.
     */
    public function fields(NovaRequest $request): array
    {
        return [];
    }
}
