<?php

declare(strict_types=1);

namespace App\Services;

use App\Http\Integrations\Ollama\OllamaConnector;
use App\Http\Integrations\Ollama\Requests\GenerateEmbeddingRequest as OllamaEmbeddingRequest;
use App\Http\Integrations\OpenAI\OpenAIConnector;
use App\Http\Integrations\OpenAI\Requests\GenerateEmbeddingRequest as OpenAIEmbeddingRequest;
use App\Models\ModelEmbedding;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

class EmbeddingService
{
    public function generateAndStore(
        Model $model,
        string $fieldName,
        string $content,
        ?string $provider = null,
        ?string $embeddingModel = null
    ): ModelEmbedding {
        $provider = $provider ?? config('ai.default', 'ollama');
        $embeddingModel = $embeddingModel ?? $this->getDefaultModelForProvider($provider);

        $contentHash = hash('sha256', $content);

        $existingEmbedding = $model->embeddings()
            ->forField($fieldName)
            ->where('content_hash', $contentHash)
            ->where('provider', $provider)
            ->where('model', $embeddingModel)
            ->first();

        if ($existingEmbedding) {
            return $existingEmbedding;
        }

        $embedding = $this->generateEmbedding($content, $provider, $embeddingModel);
        $dimensions = count($embedding);

        $embeddingData = [
            'field_name' => $fieldName,
            'provider' => $provider,
            'model' => $embeddingModel,
            'dimensions' => $dimensions,
            'source_text' => $content,
            'content_hash' => $contentHash,
            'token_count' => $this->estimateTokenCount($content),
            'embedding' => $embedding,
        ];

        // Add metadata for proposals
        if ($model instanceof \App\Models\Proposal) {
            $metadata = $this->extractProposalMetadata($model);
            $embeddingData = array_merge($embeddingData, $metadata);
        }

        $modelEmbedding = new ModelEmbedding($embeddingData);

        $modelEmbedding->calculateNorm();
        $model->embeddings()->save($modelEmbedding);

        Log::info('Generated embedding', [
            'model_type' => get_class($model),
            'model_id' => $model->id,
            'field_name' => $fieldName,
            'provider' => $provider,
            'embedding_model' => $embeddingModel,
            'dimensions' => $dimensions,
            'content_length' => strlen($content),
        ]);

        return $modelEmbedding;
    }

    public function generateEmbedding(string $text, string $provider = 'ollama', string $model = 'nomic-embed-text'): array
    {
        try {
            return match ($provider) {
                'ollama' => $this->generateOllamaEmbedding($text, $model),
                'openai' => $this->generateOpenAIEmbedding($text, $model),
                default => throw new \InvalidArgumentException("Unsupported embedding provider: {$provider}"),
            };
        } catch (\Exception $e) {
            Log::error('Failed to generate embedding', [
                'provider' => $provider,
                'model' => $model,
                'text_length' => strlen($text),
                'error' => $e->getMessage(),
            ]);

            throw new \RuntimeException("Failed to generate embedding: {$e->getMessage()}", 0, $e);
        }
    }

    private function generateOllamaEmbedding(string $text, string $model = 'nomic-embed-text'): array
    {
        $connector = new OllamaConnector;
        $request = new OllamaEmbeddingRequest($model, $text);
        $response = $connector->send($request);
        $data = $response->json();

        if (! isset($data['embedding'])) {
            throw new \RuntimeException('Invalid response from Ollama API: missing embedding data');
        }

        return $data['embedding'];
    }

    private function generateOpenAIEmbedding(string $text, string $model = 'text-embedding-3-small'): array
    {
        $apiKey = config('ai.providers.openai.api_key');
        if (! $apiKey) {
            throw new \RuntimeException('OpenAI API key not configured');
        }

        $connector = new OpenAIConnector($apiKey);
        $request = new OpenAIEmbeddingRequest($model, $text);
        $response = $connector->send($request);
        $data = $response->json();

        if (! isset($data['data'][0]['embedding'])) {
            throw new \RuntimeException('Invalid response from OpenAI API: missing embedding data');
        }

        return $data['data'][0]['embedding'];
    }

    private function getDefaultModelForProvider(string $provider): string
    {
        return match ($provider) {
            'ollama' => config('ai.providers.ollama.model', 'nomic-embed-text'),
            'openai' => config('ai.providers.openai.model', 'text-embedding-3-small'),
            default => throw new \InvalidArgumentException("Unknown provider: {$provider}"),
        };
    }

    private function estimateTokenCount(string $text): int
    {
        return (int) ceil(strlen($text) / 4);
    }

    private function extractProposalMetadata(\App\Models\Proposal $proposal): array
    {
        // Extract funding year from funded_at or created_at
        $fundingYear = null;
        if ($proposal->funded_at) {
            $fundingYear = $proposal->funded_at->year;
        } elseif ($proposal->created_at) {
            $fundingYear = $proposal->created_at->year;
        }

        return [
            'metadata' => [
                'id' => $proposal->id,
                'slug' => $proposal->slug,
                'status' => $proposal->status,
                'funding_status' => $proposal->funding_status,
            ],
            'funding_year' => $fundingYear,
            'fund_label' => $proposal->fund?->label,
            'campaign_title' => $proposal->campaign?->title,
            'is_funded' => ! is_null($proposal->funded_at),
            'amount_requested' => $proposal->amount_requested,
            'currency' => $proposal->currency,
        ];
    }

    public function findSimilarEmbeddings(
        array $queryEmbedding,
        ?string $modelType = null,
        ?string $fieldName = null,
        int $limit = 10,
        float $threshold = 0.7
    ): Collection {
        $query = ModelEmbedding::similarTo($queryEmbedding, $limit, $threshold);

        if ($modelType) {
            $query->where('embeddable_type', $modelType);
        }

        if ($fieldName) {
            $query->forField($fieldName);
        }

        return $query->with('embeddable')->get();
    }

    public function batchGenerateEmbeddings(
        Collection $models,
        array $fields,
        ?string $provider = null,
        ?string $model = null
    ): void {
        foreach ($models as $modelInstance) {
            try {
                $modelInstance->generateEmbeddings($fields, $provider, $model);
            } catch (\Exception $e) {
                Log::error('Failed to generate embeddings for model', [
                    'model_type' => get_class($modelInstance),
                    'model_id' => $modelInstance->id,
                    'error' => $e->getMessage(),
                ]);

                continue;
            }
        }
    }
}
