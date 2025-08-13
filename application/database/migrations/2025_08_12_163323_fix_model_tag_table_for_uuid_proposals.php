<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        echo "Fixing model_tag table for UUID proposals...\n";
        
        // Step 1: Add temporary UUID column
        Schema::table('model_tag', function (Blueprint $table) {
            $table->text('model_uuid')->nullable()->after('model_id');
        });
        
        // Step 2: Map old proposal IDs to UUIDs
        $proposalMappings = DB::table('proposals')
            ->whereNotNull('old_id')
            ->pluck('id', 'old_id')
            ->toArray();
            
        echo "Found " . count($proposalMappings) . " proposal ID mappings\n";
        
        // Update model_tag records in batches
        $batchSize = 100;
        $totalUpdated = 0;
        
        DB::table('model_tag')
            ->where('model_type', 'App\\Models\\Proposal')
            ->chunkById($batchSize, function ($records) use ($proposalMappings, &$totalUpdated) {
                foreach ($records as $record) {
                    if (isset($proposalMappings[$record->model_id])) {
                        DB::table('model_tag')
                            ->where('id', $record->id)
                            ->update(['model_uuid' => $proposalMappings[$record->model_id]]);
                        $totalUpdated++;
                    } else {
                        echo "Warning: No UUID mapping found for proposal old_id {$record->model_id}, skipping\n";
                    }
                }
            });
            
        echo "Updated {$totalUpdated} model_tag records with UUIDs\n";
        
        // Step 3: Verify all records have been mapped
        $unmappedCount = DB::table('model_tag')
            ->where('model_type', 'App\\Models\\Proposal')
            ->whereNull('model_uuid')
            ->count();
            
        if ($unmappedCount > 0) {
            echo "Warning: {$unmappedCount} records could not be mapped to UUIDs\n";
        }
        
        // Step 4: Change model_id column type from bigint to text
        Schema::table('model_tag', function (Blueprint $table) {
            $table->text('model_id')->change();
        });
        
        // Step 5: Copy UUID values to model_id column
        DB::table('model_tag')
            ->whereNotNull('model_uuid')
            ->update(['model_id' => DB::raw('model_uuid')]);
            
        // Step 6: Drop the temporary column
        Schema::table('model_tag', function (Blueprint $table) {
            $table->dropColumn('model_uuid');
        });
        
        echo "✅ Successfully fixed model_tag table for UUID proposals\n";
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        echo "Rolling back model_tag UUID changes...\n";
        
        // Step 1: Add temporary bigint column
        Schema::table('model_tag', function (Blueprint $table) {
            $table->bigInteger('model_bigint_id')->nullable()->after('model_id');
        });
        
        // Step 2: Map UUIDs back to old proposal IDs
        $uuidMappings = DB::table('proposals')
            ->whereNotNull('old_id')
            ->pluck('old_id', 'id')
            ->toArray();
            
        DB::table('model_tag')
            ->where('model_type', 'App\\Models\\Proposal')
            ->chunkById(100, function ($records) use ($uuidMappings) {
                foreach ($records as $record) {
                    if (isset($uuidMappings[$record->model_id])) {
                        DB::table('model_tag')
                            ->where('id', $record->id)
                            ->update(['model_bigint_id' => $uuidMappings[$record->model_id]]);
                    }
                }
            });
            
        // Step 3: Change model_id back to bigint
        Schema::table('model_tag', function (Blueprint $table) {
            $table->bigInteger('model_id')->change();
        });
        
        // Step 4: Copy bigint values back to model_id
        DB::table('model_tag')
            ->whereNotNull('model_bigint_id')
            ->update(['model_id' => DB::raw('model_bigint_id')]);
            
        // Step 5: Drop temporary column
        Schema::table('model_tag', function (Blueprint $table) {
            $table->dropColumn('model_bigint_id');
        });
        
        echo "✅ Successfully rolled back model_tag table changes\n";
    }
};
