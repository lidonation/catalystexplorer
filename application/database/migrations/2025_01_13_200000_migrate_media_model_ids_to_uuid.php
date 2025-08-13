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
        // Models that now use UUIDs
        $uuidModels = [
            'App\Models\User' => 'users',
            'App\Models\Fund' => 'funds', 
            'App\Models\IdeascaleProfile' => 'ideascale_profiles',
            'App\Models\Community' => 'communities',
            'App\Models\Campaign' => 'campaigns',
            'App\Models\Service' => 'services',
            'App\Models\Group' => 'groups',
            'App\Models\Nft' => 'nfts',
        ];

        // Models that still use bigint (no migration needed)
        $bigintModels = [
            'App\Models\Announcement' => 'announcements',
            'App\Models\Taxonomy' => 'taxonomies',
        ];

        echo "Starting media model_id migration to UUID...\n";

        // Step 1: Migrate model_id values to UUIDs for UUID-based models
        foreach ($uuidModels as $modelClass => $tableName) {
            echo "Processing {$modelClass} -> {$tableName}...\n";
            
            // Check if the target table has old_id column (for mapping)
            $hasOldId = Schema::hasColumn($tableName, 'old_id');
            
            if ($hasOldId) {
                // Map using old_id column
                DB::statement("
                    UPDATE media 
                    SET model_uuid = (
                        SELECT id 
                        FROM {$tableName} 
                        WHERE old_id::text = media.model_id
                    )
                    WHERE model_type = ? 
                    AND model_id ~ '^[0-9]+$'
                    AND model_uuid IS NULL
                ", [$modelClass]);
            } else {
                // Direct mapping (model_id should already be UUID)
                DB::statement("
                    UPDATE media 
                    SET model_uuid = (
                        SELECT id 
                        FROM {$tableName} 
                        WHERE id::text = media.model_id
                    )
                    WHERE model_type = ? 
                    AND model_uuid IS NULL
                ", [$modelClass]);
            }
            
            $count = DB::table('media')
                ->where('model_type', $modelClass)
                ->whereNotNull('model_uuid')
                ->count();
            echo "  Updated {$count} records for {$modelClass}\n";
        }

        echo "Step 2: Copying UUIDs from model_uuid to model_id for UUID models...\n";
        
        // Step 2: Copy UUIDs from model_uuid to model_id for UUID models
        foreach ($uuidModels as $modelClass => $tableName) {
            DB::statement("
                UPDATE media 
                SET model_id = model_uuid::text
                WHERE model_type = ? 
                AND model_uuid IS NOT NULL
            ", [$modelClass]);
        }

        echo "Step 3: Verifying data integrity...\n";
        
        // Step 3: Verify data integrity
        foreach ($uuidModels as $modelClass => $tableName) {
            $orphaned = DB::select("
                SELECT COUNT(*) as count
                FROM media 
                WHERE model_type = ? 
                AND NOT EXISTS (
                    SELECT 1 FROM {$tableName} 
                    WHERE id::text = media.model_id
                )
            ", [$modelClass]);
            
            if ($orphaned[0]->count > 0) {
                echo "WARNING: Found {$orphaned[0]->count} orphaned media records for {$modelClass}\n";
            }
        }

        echo "Step 4: Updating indexes...\n";
        
        // Step 4: Drop and recreate indexes to optimize for UUID queries
        Schema::table('media', function (Blueprint $table) {
            $table->dropIndex('media_model_type_model_id_index');
            $table->index(['model_type', 'model_id'], 'media_model_type_model_id_index');
        });

        echo "Media model_id migration to UUID completed successfully!\n";
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Models that use UUIDs
        $uuidModels = [
            'App\Models\User' => 'users',
            'App\Models\Fund' => 'funds', 
            'App\Models\IdeascaleProfile' => 'ideascale_profiles',
            'App\Models\Community' => 'communities',
            'App\Models\Campaign' => 'campaigns',
            'App\Models\Service' => 'services',
            'App\Models\Group' => 'groups',
            'App\Models\Nft' => 'nfts',
        ];

        echo "Rolling back media model_id UUID migration...\n";

        // Attempt to restore original numeric IDs where possible
        foreach ($uuidModels as $modelClass => $tableName) {
            $hasOldId = Schema::hasColumn($tableName, 'old_id');
            
            if ($hasOldId) {
                // Restore using old_id mapping
                DB::statement("
                    UPDATE media 
                    SET model_id = (
                        SELECT old_id::text 
                        FROM {$tableName} 
                        WHERE id::text = media.model_id
                    )
                    WHERE model_type = ?
                ", [$modelClass]);
            }
        }

        // Clear model_uuid column
        DB::table('media')->update(['model_uuid' => null]);

        echo "Rollback completed. Note: Some data may be lost if old_id columns are missing.\n";
    }
};
