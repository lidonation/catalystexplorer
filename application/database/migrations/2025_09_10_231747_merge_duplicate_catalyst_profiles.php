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
        DB::transaction(function () {
            // Get all usernames that have duplicates
            $duplicates = DB::select(
                "SELECT username, array_agg(id ORDER BY created_at ASC, id) as ids 
                 FROM catalyst_profiles 
                 GROUP BY username 
                 HAVING COUNT(*) > 1"
            );

            foreach ($duplicates as $duplicate) {
                $username = $duplicate->username;
                // Convert PostgreSQL array to PHP array
                $ids = explode(',', trim($duplicate->ids, '{}'));
                
                if (count($ids) < 2) {
                    continue;
                }

                // Keep the first one (oldest), merge others into it
                $keepId = $ids[0];
                $mergeIds = array_slice($ids, 1);

                echo "Merging {$username}: keeping {$keepId}, merging " . implode(', ', $mergeIds) . "\n";

                // Update catalyst_profile_has_proposal table
                // Move all proposal associations to the kept record
                foreach ($mergeIds as $mergeId) {
                    // Update records that don't already exist for the kept record
                    DB::statement(
                        "INSERT INTO catalyst_profile_has_proposal (catalyst_profile_id, proposal_id)
                         SELECT ?, proposal_id 
                         FROM catalyst_profile_has_proposal 
                         WHERE catalyst_profile_id = ? 
                         AND proposal_id NOT IN (
                             SELECT proposal_id 
                             FROM catalyst_profile_has_proposal 
                             WHERE catalyst_profile_id = ?
                         )",
                        [$keepId, $mergeId, $keepId]
                    );

                    // Delete old associations
                    DB::table('catalyst_profile_has_proposal')
                        ->where('catalyst_profile_id', $mergeId)
                        ->delete();
                }

                // Update proposal_profiles table (polymorphic relationship)
                foreach ($mergeIds as $mergeId) {
                    // Update records that don't already exist for the kept record
                    DB::statement(
                        "INSERT INTO proposal_profiles (profile_type, profile_id, proposal_id)
                         SELECT profile_type, ?, proposal_id 
                         FROM proposal_profiles 
                         WHERE profile_type = 'App\\Models\\CatalystProfile' 
                         AND profile_id = ?
                         AND NOT EXISTS (
                             SELECT 1 FROM proposal_profiles 
                             WHERE profile_type = 'App\\Models\\CatalystProfile' 
                             AND profile_id = ? 
                             AND proposal_id = proposal_profiles.proposal_id
                         )",
                        [$keepId, $mergeId, $keepId]
                    );

                    // Delete old records
                    DB::table('proposal_profiles')
                        ->where('profile_type', 'App\\Models\\CatalystProfile')
                        ->where('profile_id', $mergeId)
                        ->delete();
                }

                // Merge any additional data from duplicate records
                foreach ($mergeIds as $mergeId) {
                    $keepRecord = DB::table('catalyst_profiles')->where('id', $keepId)->first();
                    $mergeRecord = DB::table('catalyst_profiles')->where('id', $mergeId)->first();

                    $updateData = [];
                    
                    // Merge name if keep record doesn't have one but merge record does
                    if (empty($keepRecord->name) && !empty($mergeRecord->name)) {
                        $updateData['name'] = $mergeRecord->name;
                    }
                    
                    // Merge catalyst_id if keep record doesn't have one but merge record does
                    if (empty($keepRecord->catalyst_id) && !empty($mergeRecord->catalyst_id)) {
                        $updateData['catalyst_id'] = $mergeRecord->catalyst_id;
                    }
                    
                    // Merge claimed_by if keep record doesn't have one but merge record does
                    if (empty($keepRecord->claimed_by) && !empty($mergeRecord->claimed_by)) {
                        $updateData['claimed_by'] = $mergeRecord->claimed_by;
                    }

                    if (!empty($updateData)) {
                        DB::table('catalyst_profiles')->where('id', $keepId)->update($updateData);
                    }
                }

                // Delete the duplicate records
                DB::table('catalyst_profiles')->whereIn('id', $mergeIds)->delete();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // This migration is not reversible as we're merging data
        // The duplicates would need to be recreated manually if needed
    }
};
