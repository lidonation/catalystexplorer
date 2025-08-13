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
        echo "Starting deletion of orphaned media records...\n";

        // Models that should use UUIDs but have orphaned numeric records
        $uuidModels = [
            'App\Models\Fund' => 'funds',
            'App\Models\Group' => 'groups', 
            'App\Models\Nft' => 'nfts',
        ];

        $totalDeleted = 0;

        foreach ($uuidModels as $modelClass => $tableName) {
            echo "Processing orphaned records for {$modelClass}...\n";
            
            // Count orphaned records before deletion
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
            echo "  Found {$orphanedCount} orphaned records\n";
            
            if ($orphanedCount > 0) {
                // Show sample of what will be deleted
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
                
                echo "  Sample records to be deleted:\n";
                foreach ($samples as $sample) {
                    echo "    ID: {$sample->model_id}, Collection: {$sample->collection_name}, File: {$sample->file_name}, Created: {$sample->created_at}\n";
                }
                
                // Delete orphaned records
                $deleted = DB::delete("
                    DELETE FROM media 
                    WHERE model_type = ?
                    AND NOT EXISTS (
                        SELECT 1 FROM {$tableName} 
                        WHERE id::text = media.model_id
                    )
                ", [$modelClass]);
                
                echo "  Deleted {$deleted} orphaned records\n";
                $totalDeleted += $deleted;
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

        echo "\nDeleted {$totalDeleted} total orphaned media records!\n";
        echo "Media table UUID migration is now complete.\n";
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        echo "Cannot restore deleted orphaned media records.\n";
        echo "This migration only deleted records that were already orphaned.\n";
    }
};
