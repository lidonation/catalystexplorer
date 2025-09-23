<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Get the SQL file content from within the container
        $sqlFilePath = database_path('sql/catalyst_tallies.sql');

        if (!file_exists($sqlFilePath)) {
            throw new \Exception("SQL file not found at: {$sqlFilePath}");
        }

        $sqlContent = file_get_contents($sqlFilePath);

        Schema::dropIfExists('catalyst_tallies_imported');

        $sqlContent = str_replace('"public"."catalyst_tallies"', '"public"."catalyst_tallies_imported"', $sqlContent);
        $sqlContent = str_replace('catalyst_tallies_id_seq', 'catalyst_tallies_imported_id_seq', $sqlContent);
        $sqlContent = str_replace('catalyst_tallies_context_type_context_id_index', 'catalyst_tallies_imported_context_type_context_id_index', $sqlContent);
        $sqlContent = str_replace('catalyst_tallies_context_type_index', 'catalyst_tallies_imported_context_type_index', $sqlContent);
        $sqlContent = str_replace('catalyst_tallies_model_type_index', 'catalyst_tallies_imported_model_type_index', $sqlContent);
        
        // Fix index creation statements to reference the correct imported table
        $sqlContent = str_replace('ON public.catalyst_tallies USING', 'ON catalyst_tallies_imported USING', $sqlContent);

        DB::unprepared($sqlContent);

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

        $importedTallies = DB::table('catalyst_tallies_imported')->get();

        foreach ($importedTallies as $tally) {
            // Clean up model namespaces
            $modelType = $tally->model_type;
            $contextType = $tally->context_type;
            
            // Replace CatalystExplorer namespace references
            if ($modelType) {
                $modelType = str_replace('App\\Models\\CatalystExplorer\\', 'App\\Models\\', $modelType);
            }
            if ($contextType) {
                $contextType = str_replace('App\\Models\\CatalystExplorer\\', 'App\\Models\\', $contextType);
            }
            
            DB::table('catalyst_tallies')->insert([
                'id' => Str::uuid()->toString(),
                'hash' => $tally->hash,
                'tally' => $tally->tally,
                'model_type' => $modelType,
                'model_id' => is_numeric($tally->model_id) ? Str::uuid()->toString() : $tally->model_id, // Replace with UUID
                'context_id' => is_numeric($tally->context_id) ? Str::uuid()->toString() : $tally->context_id, // Replace with UUID
                'context_type' => $contextType,
                'updated_at' => $tally->updated_at
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
