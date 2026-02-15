<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Support\Facades\DB;

class ModelEmbedding extends Model
{
    use HasUuids;

    protected $fillable = [
        'field_name',
        'provider',
        'model',
        'dimensions',
        'source_text',
        'content_hash',
        'metadata',
        'funding_year',
        'fund_label',
        'campaign_title',
        'is_funded',
        'amount_requested',
        'currency',
        'token_count',
        'embedding',
        'embedding_norm',
    ];

    protected $casts = [
        'embedding' => 'array', // For non-PostgreSQL databases
        'metadata' => 'array',
        'dimensions' => 'integer',
        'funding_year' => 'integer',
        'is_funded' => 'boolean',
        'amount_requested' => 'decimal:2',
        'token_count' => 'integer',
        'embedding_norm' => 'float',
    ];

    public function embeddable(): MorphTo
    {
        return $this->morphTo('embeddable', 'embeddable_type', 'embeddable_id');
    }

    public function scopeForField($query, string $fieldName)
    {
        return $query->where('field_name', $fieldName);
    }

    public function scopeForProvider($query, string $provider)
    {
        return $query->where('provider', $provider);
    }

    public function scopeForModel($query, string $model)
    {
        return $query->where('model', $model);
    }

    public function scopeSimilarTo($query, array $embedding, int $limit = 10, float $threshold = 0.7)
    {
        if (DB::connection()->getDriverName() === 'pgsql') {
            $embeddingString = '['.implode(',', $embedding).']';

            return $query
                ->selectRaw('*, (1 - (embedding <=> ?::vector)) as similarity', [$embeddingString])
                ->whereRaw('(1 - (embedding <=> ?::vector)) >= ?', [$embeddingString, $threshold])
                ->orderByRaw('embedding <=> ?::vector', [$embeddingString])
                ->limit($limit);
        } else {
            throw new \Exception('Similarity search is only supported with PostgreSQL and pgvector');
        }
    }

    public function getEmbeddingArray(): array
    {
        if (DB::connection()->getDriverName() === 'pgsql') {
            $embedding = $this->attributes['embedding'];
            if (is_string($embedding)) {
                return json_decode(str_replace(['[', ']'], ['[', ']'], $embedding), true);
            }
        }

        return $this->embedding ?? [];
    }

    public function setEmbeddingAttribute($value): void
    {
        if (DB::connection()->getDriverName() === 'pgsql') {
            if (is_array($value)) {
                $this->attributes['embedding'] = '['.implode(',', $value).']';
            } else {
                $this->attributes['embedding'] = $value;
            }
        } else {
            $this->attributes['embedding'] = is_array($value) ? json_encode($value) : $value;
        }
    }

    public function calculateNorm(): void
    {
        $embedding = $this->getEmbeddingArray();
        if (empty($embedding)) {
            $this->embedding_norm = null;

            return;
        }

        $this->embedding_norm = sqrt(array_sum(array_map(fn ($x) => $x * $x, $embedding)));
    }
}
