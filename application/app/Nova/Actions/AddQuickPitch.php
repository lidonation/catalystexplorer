<?php

declare(strict_types=1);

namespace App\Nova\Actions;

use App\Models\Proposal;
use App\Services\VideoService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Laravel\Nova\Actions\Action;
use Laravel\Nova\Fields\ActionFields;
use Laravel\Nova\Fields\Text;
use Laravel\Nova\Http\Requests\NovaRequest;

class AddQuickPitch extends Action implements ShouldQueue
{
    use InteractsWithQueue, Queueable;

    /**
     * The displayable name of the action.
     *
     * @var string
     */
    public $name = 'Add Quick Pitch';

    /**
     * The action's confirmation text.
     *
     * @var string
     */
    public $confirmText = 'Are you sure you want to add this quick pitch?';

    /**
     * The action's confirmation button text.
     *
     * @var string
     */
    public $confirmButtonText = 'Add Quick Pitch';

    public function __construct(
        private VideoService $videoService
    ) {}

    /**
     * Perform the action on the given models.
     */
    public function handle(ActionFields $fields, Collection $models): void
    {
        $url = $fields->quickpitch_url;

        $models->each(function (Proposal $proposal) use ($url) {
            try {
                DB::beginTransaction();

                $youtubeRegex = '/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/';
                $vimeoRegex = '/(?:https?:\/\/)?(?:www\.)?(?:vimeo\.com\/)(\d+)/';

                if (! preg_match($youtubeRegex, (string) $url) && ! preg_match($vimeoRegex, (string) $url)) {
                    throw new \Exception('The quickpitch must be a valid YouTube or Vimeo URL.');
                }

                $normalizedUrl = $this->videoService->normalizeYouTubeUrl((string) $url);

                $duration = null;
                try {
                    $metadata = $this->videoService->getVideoMetadata($normalizedUrl);
                    $duration = $metadata['duration'] ?? null;
                } catch (\Exception $e) {
                    Log::warning('Failed to fetch video metadata for proposal quick pitch via Nova action', [
                        'proposal_id' => $proposal->id,
                        'url' => $normalizedUrl,
                        'error' => $e->getMessage(),
                    ]);
                }

                $proposal->update([
                    'quickpitch' => $normalizedUrl,
                    'quickpitch_length' => $duration,
                ]);

                DB::commit();

                $this->markAsFinished($proposal);

                Log::info('Quick pitch added successfully via Nova action', [
                    'proposal_id' => $proposal->id,
                    'quickpitch' => $normalizedUrl,
                    'quickpitch_length' => $duration,
                ]);

            } catch (\Exception|\Throwable $e) {
                DB::rollBack();

                Log::error('Failed to add quick pitch via Nova action', [
                    'proposal_id' => $proposal->id,
                    'url' => $url,
                    'error' => $e->getMessage(),
                ]);

                $this->markAsFailed($proposal, $e);
            }
        });
    }

    /**
     * Get the fields available on the action.
     */
    public function fields(NovaRequest $request): array
    {
        return [
            Text::make('Quick Pitch URL', 'quickpitch_url')
                ->required()
                ->rules([
                    'required',
                    'string',
                    'url',
                    'max:500',
                ])
                ->help('Enter a valid YouTube or Vimeo URL for the quick pitch video')
                ->placeholder('https://youtu.be/example or https://vimeo.com/123456'),
        ];
    }
}
