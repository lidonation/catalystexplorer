<?php

declare(strict_types=1);

namespace App\Concerns;

use App\Models\ModelEmbedding;
use App\Services\EmbeddingService;
use Illuminate\Database\Eloquent\Relations\MorphMany;

trait HasEmbeddings
{
    public function embeddings(): MorphMany
    {
        return $this->morphMany(ModelEmbedding::class, 'embeddable');
    }

    public function embeddingsFor(string $fieldName): MorphMany
    {
        return $this->embeddings()->forField($fieldName);
    }

    public function latestEmbeddingFor(string $fieldName): ?ModelEmbedding
    {
        return $this->embeddingsFor($fieldName)->latest()->first();
    }

    public function generateEmbeddings(?array $fields = null, ?string $provider = null, ?string $model = null): void
    {
        $embeddingService = app(EmbeddingService::class);
        $fields = $fields ?? $this->getEmbeddableFields();

        foreach ($fields as $field) {
            $content = $this->getEmbeddableContent($field);
            if (empty($content)) {
                continue;
            }

            $embeddingService->generateAndStore($this, $field, $content, $provider, $model);
        }
    }

    public function embeddingsNeedUpdate(string $fieldName): bool
    {
        $content = $this->getEmbeddableContent($fieldName);
        $contentHash = hash('sha256', $content);

        $latestEmbedding = $this->latestEmbeddingFor($fieldName);

        return ! $latestEmbedding || $latestEmbedding->content_hash !== $contentHash;
    }

    public function findSimilar(string $fieldName, int $limit = 10, float $threshold = 0.7): \Illuminate\Support\Collection
    {
        $embedding = $this->latestEmbeddingFor($fieldName);
        if (! $embedding) {
            return collect();
        }

        $similarEmbeddings = ModelEmbedding::where('embeddable_type', static::class)
            ->where('embeddable_id', '!=', $this->id)
            ->forField($fieldName)
            ->similarTo($embedding->getEmbeddingArray(), $limit, $threshold)
            ->with('embeddable')
            ->get();

        return $similarEmbeddings->pluck('embeddable');
    }

    /**
     * Override this method in your model to specify embeddable fields.
     */
    protected function getEmbeddableFields(): array
    {
        return ['title', 'content'];
    }

    /**
     * Override this method in your model for custom field handling.
     */
    protected function getEmbeddableContent(string $fieldName): string
    {
        // Handle special combined fields
        if ($fieldName === 'combined') {
            return $this->getCombinedEmbeddableContent();
        }

        // Handle translated fields - prefer English, fallback to first available
        if (in_array($fieldName, $this->translatable ?? [])) {
            $value = $this->getAttribute($fieldName);
            if (is_array($value)) {
                return $value['en'] ?? (is_array($value) ? reset($value) : $value) ?? '';
            }
        }

        return (string) $this->getAttribute($fieldName);
    }

    protected function getCombinedEmbeddableContent(): string
    {
        $parts = [];

        foreach ($this->getEmbeddableFields() as $field) {
            if ($field !== 'combined') {
                $content = $this->getEmbeddableContent($field);
                if (! empty($content)) {
                    $parts[] = $content;
                }
            }
        }

        return implode("\n\n", $parts);
    }
}
