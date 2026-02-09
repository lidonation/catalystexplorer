<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Services\EmbeddingService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class GenerateModelEmbeddingsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 300; // 5 minutes

    public int $tries = 3;

    public function __construct(
        public Model $model,
        public ?array $fields = null,
        public ?string $provider = null,
        public ?string $embeddingModel = null
    ) {}

    public function handle(EmbeddingService $embeddingService): void
    {
        try {
            Log::info('Starting embedding generation job', [
                'model_type' => get_class($this->model),
                'model_id' => $this->model->id,
                'fields' => $this->fields,
                'provider' => $this->provider,
                'embedding_model' => $this->embeddingModel,
            ]);

            // Refresh the model to ensure we have the latest data
            $this->model->refresh();

            // Generate embeddings for the specified fields or all embeddable fields
            $this->model->generateEmbeddings(
                $this->fields,
                $this->provider,
                $this->embeddingModel
            );

            Log::info('Completed embedding generation job', [
                'model_type' => get_class($this->model),
                'model_id' => $this->model->id,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to generate embeddings in background job', [
                'model_type' => get_class($this->model),
                'model_id' => $this->model->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    public function failed(\Throwable $exception): void
    {
        Log::error('Embedding generation job failed permanently', [
            'model_type' => get_class($this->model),
            'model_id' => $this->model->id,
            'exception' => $exception->getMessage(),
            'attempts' => $this->attempts(),
        ]);
    }

    /**
     * Get the tags that should be assigned to the job.
     */
    public function tags(): array
    {
        return [
            'embeddings',
            'model:'.class_basename($this->model),
            'id:'.$this->model->id,
        ];
    }
}
