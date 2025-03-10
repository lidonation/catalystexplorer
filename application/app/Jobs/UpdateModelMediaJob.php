<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Http\Intergrations\LidoNation\Requests\GetModelMedia;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\Middleware\RateLimited;
use Illuminate\Queue\SerializesModels;
use Spatie\MediaLibrary\MediaCollections\Exceptions\UnreachableUrl;

class UpdateModelMediaJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public $model,
        public ?string $collectionName = 'hero',
    ) {}

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

    public function updateModelMedia($image_url): void
    {
        try {
            if ($this->collectionName) {
                $this->model->addMediaFromUrl($image_url)
                    ->toMediaCollection($this->collectionName);
            }

            $this->model->addMediaFromUrl($image_url);
        } catch (UnreachableUrl $exception) {
            report($exception);
        }
    }

    public function middleware()
    {
        return [(new RateLimited('media-update-job'))];
    }
}
