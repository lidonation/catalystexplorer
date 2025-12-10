<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Http\Integrations\LidoNation\Requests\GetModelMedia;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\Middleware\RateLimited;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Spatie\MediaLibrary\MediaCollections\Exceptions\UnreachableUrl;

class UpdateModelMediaJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 0;

    public function __construct(
        public $model,
        public ?string $collectionName = 'hero',
    ) {}

    /**
     * @throws UnreachableUrl
     * @throws ConnectionException
     */
    public function handle(): void
    {
        $req = app(GetModelMedia::class);

        $req->body()->merge([
            'model_name' => str_replace('App\\Models\\', '', $this->model::class),
            'model_id' => $this->model->id,
            'collectionName' => $this->collectionName,
        ]);

        $res = $req->send()->body();

        if (! empty($res)) {
            $this->updateModelMedia($res);
        }
    }

    /**
     * @throws UnreachableUrl
     * @throws ConnectionException
     */
    public function updateModelMedia($image_url): void
    {
        try {
            if (! filter_var($image_url, FILTER_VALIDATE_URL)) {
                throw new \Exception('Invalid URL provided.');
            }

            $response = Http::head($image_url);

            if (! $response->successful()) {
                throw new \Exception('URL is not reachable.');
            }

            $contentType = $response->header('Content-Type');

            if (! str_starts_with($contentType, 'image/')) {
                throw new \Exception('The URL does not point to a valid media file.');
            }

            if ($this->model->getMedia($this->collectionName)->where('file_name', basename($image_url))->isNotEmpty()) {
                throw new \Exception('Media already exists in the collection.');
            }

            $this->model->addMediaFromUrl($image_url)->toMediaCollection($this->collectionName);

        } catch (UnreachableUrl|\Exception $exception) {
            report($exception);
            throw $exception;
        }
    }

    public function middleware(): array
    {
        return [(new RateLimited('media-update-job'))];
    }
}
