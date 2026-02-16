<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $connection = DB::connection();

        if ($connection->getDriverName() === 'pgsql') {
            try {
                $connection->statement('CREATE EXTENSION IF NOT EXISTS vector');
            } catch (\Exception $e) {
                if (! app()->environment('testing')) {
                    throw $e;
                }
            }
        }

        Schema::create('model_embeddings', function (Blueprint $table) use ($connection) {
            $table->uuid('id')->primary();

            $table->uuidMorphs('embeddable'); // embeddable_id, embeddable_type

            $table->string('field_name')->index();
            $table->string('provider')->index();
            $table->string('model')->index();
            $table->integer('dimensions');
            $table->text('source_text');
            $table->string('content_hash', 64)->index();
            $table->integer('token_count')->nullable(); // not applicable since we run our own inferences

            if ($connection->getDriverName() === 'pgsql') {
                $table->addColumn('vector', 'embedding', ['dimensions' => 768]); // nomic-embed-text dimensions
            } else {
                $table->json('embedding');
            }

            $table->float('embedding_norm')->nullable();
            $table->timestamps();

            // Note: uuidMorphs already creates index for ['embeddable_type', 'embeddable_id']
            $table->index(['embeddable_type', 'field_name']);
            $table->index(['provider', 'model']);
            $table->unique(['embeddable_type', 'embeddable_id', 'field_name', 'content_hash'], 'unique_model_embedding');
        });

        // Create vector indexes
        if ($connection->getDriverName() === 'pgsql' && ! app()->environment('testing')) {
            try {
                $connection->statement('CREATE INDEX model_embeddings_embedding_idx ON model_embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100)');
                 $connection->statement('CREATE INDEX model_embeddings_embedding_hnsw_idx ON model_embeddings USING hnsw (embedding vector_cosine_ops)');
            } catch (\Exception $e) {
                if (! app()->environment('testing')) {
                    report($e);
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('model_embeddings');
    }
};
