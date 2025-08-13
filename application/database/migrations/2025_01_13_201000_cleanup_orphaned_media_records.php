<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        echo "Starting cleanup of orphaned media records...\n";

        // Models that should use UUIDs
        $uuidModels = [
            'App\Models\Fund' => 'funds',
            'App\Models\Group' => 'groups', 
            'App\Models\Nft' => 'nfts',
        ];

        foreach ($uuidModels as $modelClass => $tableName) {
            echo "Processing orphaned records for {$modelClass}...\n";
            
            // First, try to fix records that have numeric IDs by mapping them via old_id
            $hasOldId = DB::select("
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = ? AND column_name = 'old_id'
            ", [$tableName]);
            
            if (!empty($hasOldId)) {
                echo "  Attempting to fix numeric IDs using old_id mapping...\n";
                
                // Update records that have numeric model_id by finding matching old_id
                $fixed = DB::update("
                    UPDATE media 
                    SET model_id = (
                        SELECT id::text 
                        FROM {$tableName} 
                        WHERE old_id::text = media.model_id
                    ),
                    model_uuid = (
                        SELECT id 
                        FROM {$tableName} 
                        WHERE old_id::text = media.model_id
                    )
                    WHERE model_type = ? 
                    AND model_id ~ '^[0-9]+$'
                    AND EXISTS (
                        SELECT 1 FROM {$tableName} 
                        WHERE old_id::text = media.model_id
                    )
                ", [$modelClass]);
                
                echo "  Fixed {$fixed} records using old_id mapping\n";
            }
            
            // Count remaining orphaned records
            $orphaned = DB::select("
                SELECT COUNT(*) as count
                FROM media 
                WHERE model_type = ?
                AND NOT EXISTS (
                    SELECT 1 FROM {$tableName} 
                    WHERE id::text = media.model_id
                )
            ", [$modelClass]);
            
            $orphanedCount = $orphaned[0]->count;
            echo "  Found {$orphanedCount} remaining orphaned records\n";
            
            if ($orphanedCount > 0) {
                // Show sample of orphaned records for manual review
                $samples = DB::select("
                    SELECT model_id, collection_name, file_name, created_at
                    FROM media 
                    WHERE model_type = ?
                    AND NOT EXISTS (
                        SELECT 1 FROM {$tableName} 
                        WHERE id::text = media.model_id
                    )
                    LIMIT 3
                ", [$modelClass]);
                
                echo "  Sample orphaned records:\n";
                foreach ($samples as $sample) {
                    echo "    ID: {$sample->model_id}, Collection: {$sample->collection_name}, File: {$sample->file_name}, Created: {$sample->created_at}\n";
                }
                
                // Option to delete orphaned records (uncomment if you want to remove them)
                /*
                $deleted = DB::delete("
                    DELETE FROM media 
                    WHERE model_type = ?
                    AND NOT EXISTS (
                        SELECT 1 FROM {$tableName} 
                        WHERE id::text = media.model_id
                    )
                ", [$modelClass]);
                echo "  Deleted {$deleted} orphaned records\n";
                */
            }
        }

        echo "\n=== Final Media Table Status ===\n";
        $finalCounts = DB::select("
            SELECT model_type, COUNT(*) as total,
            COUNT(CASE WHEN model_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN 1 END) as uuid_records,
            COUNT(CASE WHEN model_id ~ '^[0-9]+$' THEN 1 END) as numeric_records
            FROM media 
            GROUP BY model_type 
            ORDER BY model_type
        ");
        
        foreach ($finalCounts as $count) {
            echo "{$count->model_type}: {$count->total} total ({$count->uuid_records} UUID, {$count->numeric_records} numeric)\n";
        }

        echo "\nOrphaned media cleanup completed!\n";
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // This migration only cleans up data, no schema changes to reverse
        echo "No rollback needed for orphaned media cleanup.\n";
    }
};
