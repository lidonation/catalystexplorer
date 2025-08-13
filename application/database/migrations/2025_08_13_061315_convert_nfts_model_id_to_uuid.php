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
        echo "Converting nfts.model_id from bigint to UUID...\n";
        
        // Get record counts
        $totalRecords = DB::table('nfts')->count();
        $ideascaleRecords = DB::table('nfts')->where('model_type', 'App\\Models\\IdeascaleProfile')->whereNotNull('model_id')->count();
        $catalystUserRecords = DB::table('nfts')->where('model_type', 'App\\Models\\CatalystUser')->whereNotNull('model_id')->count();
        $nullRecords = DB::table('nfts')->whereNull('model_id')->count();
        
        echo "Total records: {$totalRecords}\n";
        echo "IdeascaleProfile records: {$ideascaleRecords}\n";
        echo "CatalystUser records: {$catalystUserRecords}\n";
        echo "NULL model_id records: {$nullRecords}\n";
        
        // Step 1: Add temporary UUID column
        Schema::table('nfts', function (Blueprint $table) {
            $table->uuid('model_uuid')->nullable()->after('model_id');
        });
        
        echo "Added temporary model_uuid column.\n";
        
        // Step 2: Convert IdeascaleProfile references
        if ($ideascaleRecords > 0) {
            echo "Converting IdeascaleProfile model_id values to UUIDs...\n";
            
            $updated = DB::statement("
                UPDATE nfts 
                SET model_uuid = ideascale_profiles.id
                FROM ideascale_profiles 
                WHERE nfts.model_type = 'App\\Models\\IdeascaleProfile'
                  AND nfts.model_id IS NOT NULL
                  AND nfts.model_id = ideascale_profiles.old_id
            ");
            
            // Check for unmapped records
            $unmappedIdeascale = DB::table('nfts')
                ->where('model_type', 'App\\Models\\IdeascaleProfile')
                ->whereNotNull('model_id')
                ->whereNull('model_uuid')
                ->count();
            
            if ($unmappedIdeascale > 0) {
                echo "Warning: {$unmappedIdeascale} IdeascaleProfile records could not be mapped to UUIDs.\n";
                
                // Get examples
                $examples = DB::table('nfts')
                    ->where('model_type', 'App\\Models\\IdeascaleProfile')
                    ->whereNotNull('model_id')
                    ->whereNull('model_uuid')
                    ->select('id', 'model_id', 'name')
                    ->take(5)
                    ->get();
                
                foreach ($examples as $example) {
                    echo "  NFT ID: {$example->id}, Model ID: {$example->model_id}, Name: {$example->name}\n";
                }
                
                // Set these to NULL since they reference non-existent profiles
                DB::table('nfts')
                    ->where('model_type', 'App\\Models\\IdeascaleProfile')
                    ->whereNotNull('model_id')
                    ->whereNull('model_uuid')
                    ->update(['model_id' => null, 'model_type' => null]);
                
                echo "Set {$unmappedIdeascale} unmappable records to NULL.\n";
            } else {
                echo "All IdeascaleProfile records successfully mapped to UUIDs.\n";
            }
        }
        
        // Step 3: Handle CatalystUser records (set to NULL since model doesn't exist)
        if ($catalystUserRecords > 0) {
            echo "Handling CatalystUser records (model no longer exists)...\n";
            
            DB::table('nfts')
                ->where('model_type', 'App\\Models\\CatalystUser')
                ->update(['model_id' => null, 'model_type' => null]);
            
            echo "Set {$catalystUserRecords} CatalystUser records to NULL.\n";
        }
        
        // Step 4: Drop the existing index
        Schema::table('nfts', function (Blueprint $table) {
            $table->dropIndex('nfts_model_id_model_type_index');
        });
        
        echo "Dropped existing model_id index.\n";
        
        // Step 5: Convert model_id column to UUID type
        DB::statement('ALTER TABLE nfts ALTER COLUMN model_id TYPE uuid USING model_uuid');
        
        echo "Converted model_id column to UUID type.\n";
        
        // Step 6: Drop temporary column
        Schema::table('nfts', function (Blueprint $table) {
            $table->dropColumn('model_uuid');
        });
        
        echo "Dropped temporary model_uuid column.\n";
        
        // Step 7: Recreate the index
        Schema::table('nfts', function (Blueprint $table) {
            $table->index(['model_id', 'model_type'], 'nfts_model_id_model_type_index');
        });
        
        echo "Recreated model_id index.\n";
        echo "Migration completed successfully!\n";
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        echo "Reverting nfts.model_id from UUID to bigint...\n";
        
        // This rollback is destructive and not recommended
        // as we cannot accurately map UUIDs back to old bigint IDs
        throw new \Exception('Rollback not supported for this migration. UUID to bigint conversion would lose data integrity.');
    }
};
