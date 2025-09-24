<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use League\Csv\Reader;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Read from CSV file instead of SQL dump
        $csvFilePath = database_path('sql/cx.catalyst_tallies.csv');

        if (!file_exists($csvFilePath)) {
            throw new \Exception("CSV file not found at: {$csvFilePath}");
        }

        Schema::dropIfExists('catalyst_tallies');
        Schema::create('catalyst_tallies', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('hash')->index();
            $table->integer('tally');
            $table->string('model_type')->nullable();
            $table->uuid('model_id')->nullable();
            $table->uuid('context_id')->nullable();
            $table->string('context_type')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->nullable();

            $table->index(['model_type', 'model_id']);
            $table->index(['context_type', 'context_id']);
            $table->index('context_type');
        });

        // Fund ID mapping from CatalystFunds enum (old numeric ID => new UUID)
        $fundMapping = [
            '95' => '8aee7892-b6b8-4c26-b413-96b16fd1a382', // Fund 2
            '91' => '0dbcc13d-294f-4a0d-b3cf-ed6997babf48', // Fund 3
            '84' => '11bc609d-00ba-4d08-9a81-a902d7c313eb', // Fund 4
            '32' => 'bf4496d8-6472-41ac-ab05-ccdd92960ee0', // Fund 5
            '21' => '00278789-c0ab-4298-9928-31bf35b09e40', // Fund 6
            '58' => '1389b51c-4320-49a6-9385-eb860e7189b9', // Fund 7
            '61' => '2fbb9439-c74a-4c33-ac37-e8a28a9a2e2c', // Fund 8
            '97' => '9031ef94-1d7b-4b29-b921-de73b9dadbce', // Fund 9
            '113' => '4890007c-d31c-4561-870f-14388d6b6d2c', // Fund 10
            '129' => '72c34fba-3665-4dfa-b6b1-ff72c916dc9c', // Fund 11
            '139' => 'e4e8ea34-867e-4f19-aea6-55d83ecb4ecd', // Fund 12
            '146' => 'f7ab84cf-504a-43d7-b2fe-c4acd4113528', // Fund 13
            '147' => 'b77b307e-2e83-4f9d-8be1-ba9f600299f3', // Fund 14
            '0' => '0', // Fund 0
            '1' => '1', // Fund 1
        ];
        
        // Create a mapping of old_id to UUID for proposals
        $proposalMapping = DB::table('proposals')
            ->whereNotNull('old_id')
            ->pluck('id', 'old_id')
            ->toArray();

        // Read and process CSV file
        $csv = Reader::createFromPath($csvFilePath, 'r');
        $csv->setHeaderOffset(0); // First row contains headers
        
        $records = $csv->getRecords();
        
        foreach ($records as $record) {
            // Clean up model namespaces
            $modelType = !empty($record['model_type']) ? $record['model_type'] : null;
            $contextType = !empty($record['context_type']) ? $record['context_type'] : null;
            
            // Replace CatalystExplorer namespace references
            if ($modelType) {
                $modelType = str_replace('App\\Models\\CatalystExplorer\\', 'App\\Models\\', $modelType);
            }
            if ($contextType) {
                $contextType = str_replace('App\\Models\\CatalystExplorer\\', 'App\\Models\\', $contextType);
            }
            
            // Map context_id using fund mapping
            $contextId = null;
            if (!empty($record['context_id'])) {
                $contextIdValue = $record['context_id'];
                if (is_numeric($contextIdValue) && isset($fundMapping[$contextIdValue])) {
                    $contextId = $fundMapping[$contextIdValue];
                } elseif (is_numeric($contextIdValue)) {
                    // If numeric but not in mapping, keep as string for Fund 0 and 1
                    $contextId = $contextIdValue;
                }
            }
            
            // Map model_id using proposals.old_id lookup (keep null as null)
            $modelId = null;
            if (!empty($record['model_id']) && is_numeric($record['model_id'])) {
                $modelId = $proposalMapping[$record['model_id']] ?? null;
            }
            
            DB::table('catalyst_tallies')->insert([
                'id' => Str::uuid()->toString(),
                'hash' => $record['hash'],
                'tally' => (int) $record['tally'],
                'model_type' => $modelType,
                'model_id' => $modelId,
                'context_id' => $contextId,
                'context_type' => $contextType,
                'updated_at' => $record['updated_at'],
                'created_at' => $record['updated_at'] // Set created_at to same as updated_at
            ]);
        }
        Schema::dropIfExists('catalyst_tallies_imported');
        DB::statement('DROP SEQUENCE IF EXISTS catalyst_tallies_imported_id_seq');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop the catalyst_tallies table and clean up
        try {
            Schema::dropIfExists('catalyst_tallies');
            // Also clean up any leftover temporary tables
            Schema::dropIfExists('catalyst_tallies_imported');
            DB::statement('DROP SEQUENCE IF EXISTS catalyst_tallies_id_seq');
            DB::statement('DROP SEQUENCE IF EXISTS catalyst_tallies_imported_id_seq');
            echo "Successfully rolled back catalyst_tallies migration.\n";
        } catch (\Exception $e) {
            echo "Warning during rollback: " . $e->getMessage() . "\n";
            // Continue anyway, as some cleanup might still be needed
        }
    }
};
