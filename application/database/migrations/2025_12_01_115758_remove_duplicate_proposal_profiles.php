<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * This migration removes duplicate ProposalProfile attachments where the same
     * proposal_id, profile_type, and profile_id combination exists multiple times.
     * It preserves the record with the smallest UUID (oldest record) in each duplicate group.
     */
    public function up(): void
    {
        // First, get statistics about duplicates before removal
        $duplicateStats = DB::select('
            SELECT 
                COUNT(*) as total_duplicate_groups,
                SUM(duplicate_count - 1) as records_to_remove
            FROM (
                SELECT proposal_id, profile_type, profile_id, COUNT(*) as duplicate_count
                FROM proposal_profiles
                GROUP BY proposal_id, profile_type, profile_id
                HAVING COUNT(*) > 1
            ) as duplicates
        ')[0];

        $totalBefore = DB::table('proposal_profiles')->count();
        
        echo "\n=== Proposal Profiles Duplicate Removal ===\n";
        echo "Total records before: {$totalBefore}\n";
        echo "Duplicate groups found: {$duplicateStats->total_duplicate_groups}\n";
        echo "Duplicate records to remove: {$duplicateStats->records_to_remove}\n";

        if ($duplicateStats->records_to_remove > 0) {
            // Use a CTE (Common Table Expression) to identify and delete duplicates
            // Keep the record with the smallest id (which represents the oldest record)
            $deletedCount = DB::delete('
                DELETE FROM proposal_profiles 
                WHERE id IN (
                    SELECT id FROM (
                        SELECT 
                            id,
                            ROW_NUMBER() OVER (
                                PARTITION BY proposal_id, profile_type, profile_id 
                                ORDER BY id ASC
                            ) as row_num
                        FROM proposal_profiles
                    ) ranked
                    WHERE row_num > 1
                )
            ');

            $totalAfter = DB::table('proposal_profiles')->count();
            
            echo "Duplicate records removed: {$deletedCount}\n";
            echo "Total records after: {$totalAfter}\n";
            echo "Expected records after: " . ($totalBefore - $duplicateStats->records_to_remove) . "\n";
            
            // Verify the cleanup was successful
            $remainingDuplicates = DB::select('
                SELECT COUNT(*) as remaining_duplicates
                FROM (
                    SELECT proposal_id, profile_type, profile_id, COUNT(*) as duplicate_count
                    FROM proposal_profiles
                    GROUP BY proposal_id, profile_type, profile_id
                    HAVING COUNT(*) > 1
                ) as duplicates
            ')[0]->remaining_duplicates;
            
            echo "Remaining duplicate groups: {$remainingDuplicates}\n";
            
            if ($remainingDuplicates > 0) {
                throw new \Exception("Migration failed: {$remainingDuplicates} duplicate groups still exist");
            }
        } else {
            echo "No duplicates found - no action needed\n";
        }
        
        echo "=== Migration completed successfully ===\n\n";
    }

    /**
     * Reverse the migrations.
     * 
     * Note: This migration is not reversible as we're removing duplicate data.
     * The original duplicates cannot be restored since we don't know which
     * specific records were duplicates or their exact values.
     */
    public function down(): void
    {
        // This migration is not reversible - we cannot restore deleted duplicate data
        throw new \Exception(
            'This migration cannot be reversed. Duplicate proposal profile attachments '
            . 'have been permanently removed and cannot be restored.'
        );
    }
};
