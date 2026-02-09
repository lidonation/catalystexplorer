<?php

namespace App\Console\Commands;

use App\Jobs\GenerateModelEmbeddingsJob;
use App\Services\EmbeddingService;
use Illuminate\Console\Command;
use Illuminate\Database\Eloquent\Model;

class GenerateModelEmbeddings extends Command
{
    protected $signature = 'embeddings:generate
                           {model : The model class name (e.g., Proposal, Community)}
                           {--provider=ollama : The embedding provider to use (ollama, openai)}
                           {--model-name= : The specific embedding model to use (defaults to provider default)}
                           {--fields= : Comma-separated list of fields to embed (defaults to all)}
                           {--batch-size=50 : Number of models to process at once}
                           {--force : Regenerate embeddings even if they exist}
                           {--where= : WHERE clause to filter records (e.g., "fund_id=123")}
                           {--limit= : Maximum number of records to process}
                           {--queue : Process embeddings in background queue jobs (default)}
                           {--sync : Process embeddings synchronously instead of using queue}';

    protected $description = 'Generate embeddings for any model class that uses the HasEmbeddings trait (uses background jobs by default)';

    public function handle(EmbeddingService $embeddingService): int
    {
        $modelName = $this->argument('model');
        $provider = $this->option('provider');
        $modelNameOption = $this->option('model-name');
        $fields = $this->option('fields') ? explode(',', $this->option('fields')) : null;
        $batchSize = (int) $this->option('batch-size');
        $force = $this->option('force');
        $whereClause = $this->option('where');
        $limit = $this->option('limit') ? (int) $this->option('limit') : null;

        // Determine processing mode: queue by default, unless --sync is specified
        $useQueue = ! $this->option('sync');

        if ($this->option('queue') && $this->option('sync')) {
            $this->error('Cannot specify both --queue and --sync options. Use one or the other.');

            return self::FAILURE;
        }

        // Resolve the model class
        $modelClass = $this->resolveModelClass($modelName);
        if (! $modelClass) {
            $this->error("Model '{$modelName}' not found. Please provide a valid model class name.");

            return self::FAILURE;
        }

        // Check if model uses HasEmbeddings trait
        if (! $this->modelHasEmbeddingsTrait($modelClass)) {
            $this->error("Model '{$modelClass}' does not use the HasEmbeddings trait.");

            return self::FAILURE;
        }

        $this->info("Starting embedding generation for {$modelClass}...");
        $this->info("Provider: {$provider}");
        $this->info('Processing mode: '.($useQueue ? 'Queue (background jobs)' : 'Synchronous'));
        if ($modelNameOption) {
            $this->info("Model: {$modelNameOption}");
        }
        if ($fields) {
            $this->info('Fields: '.implode(', ', $fields));
        }
        if ($whereClause) {
            $this->info("Filter: {$whereClause}");
        }

        // Build query
        $query = $modelClass::query();

        if ($whereClause) {
            // Parse simple WHERE clauses like "fund_id=123" or "status=active"
            $this->applyWhereClause($query, $whereClause);
        }

        if ($limit) {
            $query->limit($limit);
        }

        $totalCount = $query->count();
        $this->info("Found {$totalCount} records to process");

        if ($totalCount === 0) {
            $this->warn('No records found to process.');

            return self::SUCCESS;
        }

        $progressBar = $this->output->createProgressBar($totalCount);
        $progressBar->start();

        $processed = 0;
        $errors = 0;
        $skipped = 0;

        // Process in batches
        $query->chunk($batchSize, function ($models) use (
            $useQueue,
            $provider,
            $modelNameOption,
            $fields,
            $force,
            $progressBar,
            &$processed,
            &$errors,
            &$skipped
        ) {
            foreach ($models as $model) {
                try {
                    // Check if embeddings already exist and force is not set
                    if (! $force) {
                        $fieldsToProcess = $fields ?? $model->getEmbeddableFields();
                        $hasExistingEmbeddings = true;

                        foreach ($fieldsToProcess as $field) {
                            if ($model->embeddingsNeedUpdate($field)) {
                                $hasExistingEmbeddings = false;
                                break;
                            }
                        }

                        if ($hasExistingEmbeddings) {
                            $skipped++;
                            $progressBar->advance();

                            continue;
                        }
                    }

                    // Generate embeddings - use queue or sync mode
                    if ($useQueue) {
                        // Dispatch background job for embedding generation
                        GenerateModelEmbeddingsJob::dispatch($model, $fields, $provider, $modelNameOption);
                    } else {
                        // Process synchronously
                        $model->generateEmbeddings($fields, $provider, $modelNameOption);
                    }
                    $processed++;
                } catch (\Exception $e) {
                    $errors++;
                    $this->error("\nError processing {$model->getKey()}: ".$e->getMessage());
                }

                $progressBar->advance();
            }
        });

        $progressBar->finish();
        $this->newLine(2);

        // Display results
        if ($useQueue) {
            $this->info('Embedding generation jobs queued!');
            $this->table(
                ['Metric', 'Count'],
                [
                    ['Total Records', $totalCount],
                    ['Jobs Dispatched', $processed],
                    ['Skipped (up-to-date)', $skipped],
                    ['Errors', $errors],
                ]
            );

            if ($processed > 0) {
                $this->info("Successfully dispatched {$processed} background jobs for embedding generation.");
                $this->info('Monitor queue worker logs to track progress: php artisan queue:work --queue=embeddings');
            }
        } else {
            $this->info('Embedding generation completed!');
            $this->table(
                ['Metric', 'Count'],
                [
                    ['Total Records', $totalCount],
                    ['Processed', $processed],
                    ['Skipped (up-to-date)', $skipped],
                    ['Errors', $errors],
                ]
            );
        }

        if ($errors > 0) {
            $this->warn("Completed with {$errors} errors. Check the logs for details.");

            return self::FAILURE;
        }

        if ($useQueue && $processed > 0) {
            $this->info('All embedding generation jobs have been queued successfully!');
        } elseif (! $useQueue) {
            $this->info('All embeddings generated successfully!');
        }

        return self::SUCCESS;
    }

    private function resolveModelClass(string $modelName): ?string
    {
        // Try different namespace patterns
        $patterns = [
            "App\\Models\\{$modelName}",
            $modelName, // If full class name is provided
        ];

        foreach ($patterns as $pattern) {
            if (class_exists($pattern) && is_subclass_of($pattern, Model::class)) {
                return $pattern;
            }
        }

        return null;
    }

    private function modelHasEmbeddingsTrait(string $modelClass): bool
    {
        $traits = class_uses_recursive($modelClass);

        return in_array('App\\Concerns\\HasEmbeddings', $traits);
    }

    private function applyWhereClause($query, string $whereClause): void
    {
        // Parse simple WHERE clauses like "column=value" or "column!=value"
        if (preg_match('/^(\w+)(=|!=|>|<|>=|<=)(.+)$/', $whereClause, $matches)) {
            $column = $matches[1];
            $operator = $matches[2];
            $value = trim($matches[3], '"\' ');

            $query->where($column, $operator, $value);
        } else {
            throw new \InvalidArgumentException("Invalid WHERE clause format: {$whereClause}. Use format like 'column=value'");
        }
    }
}
