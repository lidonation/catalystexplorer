<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('proposal_profiles') || !Schema::hasTable('ideascale_profiles')) {
            return;
        }

        // Check if old_id column exists
        if (!Schema::hasColumn('ideascale_profiles', 'old_id')) {
            echo "old_id column not found in ideascale_profiles, skipping mapping\n";
            return;
        }

        // Step 1: Show current state
        $numericCount = DB::selectOne(
            "SELECT COUNT(*) as count FROM proposal_profiles 
             WHERE profile_type = 'App\\\\Models\\\\IdeascaleProfile' 
             AND profile_id ~ '^[0-9]+$'"
        )->count;
        
        echo "Found $numericCount numeric proposal_profiles entries to map\n";

        if ($numericCount == 0) {
            echo "No numeric entries to map\n";
            return;
        }

        // Step 2: Test if we can find matches
        $mappableCount = DB::selectOne(
            "SELECT COUNT(*) as count 
             FROM proposal_profiles pp 
             JOIN ideascale_profiles ip ON ip.old_id = pp.profile_id::bigint
             WHERE pp.profile_type = 'App\\\\Models\\\\IdeascaleProfile' 
             AND pp.profile_id ~ '^[0-9]+$'
             AND ip.old_id IS NOT NULL"
        )->count;
        
        echo "Found $mappableCount entries that can be mapped\n";

        if ($mappableCount == 0) {
            echo "No mappable entries found, removing numeric entries\n";
            $deleted = DB::delete(
                "DELETE FROM proposal_profiles 
                 WHERE profile_type = 'App\\\\Models\\\\IdeascaleProfile' 
                 AND profile_id ~ '^[0-9]+$'"
            );
            echo "Deleted $deleted unmappable entries\n";
            return;
        }

        // Step 3: Do the mapping in smaller batches
        $batchSize = 1000;
        $totalUpdated = 0;
        
        do {
            $updated = DB::update(
                "UPDATE proposal_profiles 
                 SET profile_id = ip.id
                 FROM ideascale_profiles ip 
                 WHERE proposal_profiles.profile_type = 'App\\\\Models\\\\IdeascaleProfile'
                   AND proposal_profiles.profile_id ~ '^[0-9]+$'
                   AND ip.old_id = proposal_profiles.profile_id::bigint
                   AND proposal_profiles.id IN (
                     SELECT pp2.id FROM proposal_profiles pp2 
                     WHERE pp2.profile_type = 'App\\\\Models\\\\IdeascaleProfile'
                       AND pp2.profile_id ~ '^[0-9]+$'
                     LIMIT $batchSize
                   )"
            );
            
            $totalUpdated += $updated;
            echo "Batch updated: $updated rows (total: $totalUpdated)\n";
            
        } while ($updated > 0);

        // Step 4: Clean up any remaining numeric entries
        $remaining = DB::delete(
            "DELETE FROM proposal_profiles 
             WHERE profile_type = 'App\\\\Models\\\\IdeascaleProfile' 
             AND profile_id ~ '^[0-9]+$'"
        );
        
        if ($remaining > 0) {
            echo "Removed $remaining unmappable numeric entries\n";
        }

        // Step 5: Report final state
        $finalUuidCount = DB::selectOne(
            "SELECT COUNT(*) as count FROM proposal_profiles 
             WHERE profile_type = 'App\\\\Models\\\\IdeascaleProfile' 
             AND profile_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'"
        )->count;
        
        echo "Final state: $finalUuidCount UUID entries for IdeascaleProfile\n";
    }

    public function down(): void
    {
        // This migration cannot be safely reversed
        echo "Cannot reverse UUID mapping migration\n";
    }
};
