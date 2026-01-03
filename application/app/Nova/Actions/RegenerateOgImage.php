<?php

declare(strict_types=1);

namespace App\Nova\Actions;

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
        $deletedCount = 0;
        $failedCount = 0;

        foreach ($models as $proposal) {
            $imagePath = "og-images/{$proposal->slug}.png";

            try {
                if ($disk->exists($imagePath)) {
                    $disk->delete($imagePath);
                    $deletedCount++;
                } else {
                    // Image doesn't exist, consider it successful (will be generated on next access)
                    $deletedCount++;
                }
            } catch (\Exception $e) {
                $failedCount++;
                \Log::error('Failed to delete OG image', [
                    'proposal_id' => $proposal->id,
                    'slug' => $proposal->slug,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        if ($failedCount > 0) {
            return Action::danger("Regenerated {$deletedCount} OG image(s), but {$failedCount} failed. Check logs for details.");
        }

        return Action::message("Successfully regenerated {$deletedCount} OG image(s). Images will be generated on next access.");
    }

    /**
     * Get the fields available on the action.
     */
    public function fields(NovaRequest $request): array
    {
        return [];
    }
}
