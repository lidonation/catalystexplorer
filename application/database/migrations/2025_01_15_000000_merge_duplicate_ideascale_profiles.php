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
            // Get all ideascale_id values that have duplicates
            // Using ideascale_id as the primary deduplication key since it should be unique per profile
            $duplicates = DB::select(
                "SELECT ideascale_id, array_agg(id ORDER BY created_at ASC, id) as ids 
                 FROM ideascale_profiles 
                 WHERE ideascale_id IS NOT NULL 
                 GROUP BY ideascale_id 
                 HAVING COUNT(*) > 1"
            );

            $this->logMessage("Found " . count($duplicates) . " sets of duplicate IdeascaleProfiles to merge");

            foreach ($duplicates as $duplicate) {
                $ideascaleId = $duplicate->ideascale_id;
                // Convert PostgreSQL array to PHP array
                $ids = explode(',', trim($duplicate->ids, '{}'));
                
                if (count($ids) < 2) {
                    continue;
                }

                // Keep the first one (oldest), merge others into it
                $keepId = $ids[0];
                $mergeIds = array_slice($ids, 1);

                $this->logMessage("Merging IdeascaleProfile ideascale_id {$ideascaleId}: keeping {$keepId}, merging " . implode(', ', $mergeIds));

                $this->mergeProposalProfiles($keepId, $mergeIds);
                $this->mergeGroupRelationships($keepId, $mergeIds);
                $this->mergeMonthlyReports($keepId, $mergeIds);
                $this->mergeNfts($keepId, $mergeIds);
                $this->mergeLegacyRelationships($keepId, $mergeIds);
                $this->mergeProfileData($keepId, $mergeIds);

                // Delete the duplicate records
                DB::table('ideascale_profiles')->whereIn('id', $mergeIds)->delete();

                $this->logMessage("Successfully merged and deleted duplicate IdeascaleProfiles: " . implode(', ', $mergeIds));
            }

            // Also handle duplicates by username where ideascale_id is null
            $usernameDuplicates = DB::select(
                "SELECT username, array_agg(id ORDER BY created_at ASC, id) as ids 
                 FROM ideascale_profiles 
                 WHERE username IS NOT NULL AND ideascale_id IS NULL
                 GROUP BY username 
                 HAVING COUNT(*) > 1"
            );

            $this->logMessage("Found " . count($usernameDuplicates) . " sets of username-duplicate IdeascaleProfiles (no ideascale_id) to merge");

            foreach ($usernameDuplicates as $duplicate) {
                $username = $duplicate->username;
                $ids = explode(',', trim($duplicate->ids, '{}'));
                
                if (count($ids) < 2) {
                    continue;
                }

                $keepId = $ids[0];
                $mergeIds = array_slice($ids, 1);

                $this->logMessage("Merging IdeascaleProfile username {$username}: keeping {$keepId}, merging " . implode(', ', $mergeIds));

                $this->mergeProposalProfiles($keepId, $mergeIds);
                $this->mergeGroupRelationships($keepId, $mergeIds);
                $this->mergeMonthlyReports($keepId, $mergeIds);
                $this->mergeNfts($keepId, $mergeIds);
                $this->mergeLegacyRelationships($keepId, $mergeIds);
                $this->mergeProfileData($keepId, $mergeIds);

                DB::table('ideascale_profiles')->whereIn('id', $mergeIds)->delete();

                $this->logMessage("Successfully merged and deleted duplicate IdeascaleProfiles: " . implode(', ', $mergeIds));
            }
        });
    }

    /**
     * Merge proposal_profiles polymorphic relationship
     */
    private function mergeProposalProfiles(string $keepId, array $mergeIds): void
    {
        foreach ($mergeIds as $mergeId) {
            // Move records that don't already exist for the kept record
            DB::statement(
                "INSERT INTO proposal_profiles (profile_type, profile_id, proposal_id)
                 SELECT profile_type, ?, proposal_id 
                 FROM proposal_profiles 
                 WHERE profile_type = 'App\\\\Models\\\\IdeascaleProfile' 
                 AND profile_id = ?
                 AND NOT EXISTS (
                     SELECT 1 FROM proposal_profiles 
                     WHERE profile_type = 'App\\\\Models\\\\IdeascaleProfile' 
                     AND profile_id = ? 
                     AND proposal_id = proposal_profiles.proposal_id
                 )",
                [$keepId, $mergeId, $keepId]
            );

            // Delete old records
            DB::table('proposal_profiles')
                ->where('profile_type', 'App\\Models\\IdeascaleProfile')
                ->where('profile_id', $mergeId)
                ->delete();
        }
    }

    /**
     * Merge group_has_ideascale_profile pivot table relationships
     */
    private function mergeGroupRelationships(string $keepId, array $mergeIds): void
    {
        foreach ($mergeIds as $mergeId) {
            // Move group relationships that don't already exist for the kept record
            DB::statement(
                "INSERT INTO group_has_ideascale_profile (group_id, ideascale_profile_id)
                 SELECT group_id, ? 
                 FROM group_has_ideascale_profile 
                 WHERE ideascale_profile_id = ?
                 AND group_id NOT IN (
                     SELECT group_id 
                     FROM group_has_ideascale_profile 
                     WHERE ideascale_profile_id = ?
                 )",
                [$keepId, $mergeId, $keepId]
            );

            // Delete old group relationships
            DB::table('group_has_ideascale_profile')
                ->where('ideascale_profile_id', $mergeId)
                ->delete();
        }
    }

    /**
     * Merge monthly_reports relationship
     */
    private function mergeMonthlyReports(string $keepId, array $mergeIds): void
    {
        foreach ($mergeIds as $mergeId) {
            // Update monthly reports to point to the kept profile
            DB::table('monthly_reports')
                ->where('ideascale_profile_id', $mergeId)
                ->update(['ideascale_profile_id' => $keepId]);
        }
    }

    /**
     * Merge NFTs relationship
     */
    private function mergeNfts(string $keepId, array $mergeIds): void
    {
        foreach ($mergeIds as $mergeId) {
            // Update NFTs to point to the kept profile
            DB::table('nfts')
                ->where('model_type', 'App\\Models\\IdeascaleProfile')
                ->where('model_id', $mergeId)
                ->update(['model_id' => $keepId]);
        }
    }

    /**
     * Merge any legacy relationships that might still exist
     */
    private function mergeLegacyRelationships(string $keepId, array $mergeIds): void
    {
        // Check if ideascale_profile_has_proposal table still exists (legacy)
        if (Schema::hasTable('ideascale_profile_has_proposal')) {
            foreach ($mergeIds as $mergeId) {
                DB::statement(
                    "INSERT INTO ideascale_profile_has_proposal (ideascale_profile_id, proposal_id)
                     SELECT ?, proposal_id 
                     FROM ideascale_profile_has_proposal 
                     WHERE ideascale_profile_id = ? 
                     AND proposal_id NOT IN (
                         SELECT proposal_id 
                         FROM ideascale_profile_has_proposal 
                         WHERE ideascale_profile_id = ?
                     )",
                    [$keepId, $mergeId, $keepId]
                );

                DB::table('ideascale_profile_has_proposal')
                    ->where('ideascale_profile_id', $mergeId)
                    ->delete();
            }
        }

        // Handle any other tables that reference ideascale_profile_id
        $this->mergeGenericForeignKeyReferences($keepId, $mergeIds, 'ideascale_profile_id');
    }

    /**
     * Merge profile data fields, preferring non-null values
     */
    private function mergeProfileData(string $keepId, array $mergeIds): void
    {
        foreach ($mergeIds as $mergeId) {
            $keepRecord = DB::table('ideascale_profiles')->where('id', $keepId)->first();
            $mergeRecord = DB::table('ideascale_profiles')->where('id', $mergeId)->first();

            $updateData = [];
            
            // Merge fields where keep record is null/empty but merge record has data
            $fieldsToMerge = [
                'name',
                'email',
                'bio',
                'twitter',
                'linkedin',
                'discord',
                'ideascale',
                'telegram',
                'title',
                'ideascale_id',
                'claimed_by_uuid'
            ];

            foreach ($fieldsToMerge as $field) {
                $keepValue = $keepRecord->$field ?? null;
                $mergeValue = $mergeRecord->$field ?? null;

                // Update if keep record is empty/null and merge record has a value
                if (empty($keepValue) && !empty($mergeValue)) {
                    $updateData[$field] = $mergeValue;
                }
            }

            // Special handling for claimed_by_uuid - prefer claimed profiles
            if (empty($keepRecord->claimed_by_uuid) && !empty($mergeRecord->claimed_by_uuid)) {
                $updateData['claimed_by_uuid'] = $mergeRecord->claimed_by_uuid;
            }

            if (!empty($updateData)) {
                DB::table('ideascale_profiles')->where('id', $keepId)->update($updateData);
                $this->logMessage("Updated profile {$keepId} with merged data: " . json_encode($updateData));
            }
        }
    }

    /**
     * Generic method to merge foreign key references
     */
    private function mergeGenericForeignKeyReferences(string $keepId, array $mergeIds, string $foreignKeyColumn): void
    {
        // Get all tables that have the foreign key column
        $tables = DB::select(
            "SELECT table_name 
             FROM information_schema.columns 
             WHERE column_name = ? 
             AND table_schema = current_schema()",
            [$foreignKeyColumn]
        );

        foreach ($tables as $table) {
            $tableName = $table->table_name;
            
            // Skip tables we've already handled specifically
            if (in_array($tableName, [
                'ideascale_profiles',
                'group_has_ideascale_profile', 
                'monthly_reports',
                'ideascale_profile_has_proposal'
            ])) {
                continue;
            }

            foreach ($mergeIds as $mergeId) {
                // Update foreign key references to point to the kept record
                $updated = DB::table($tableName)
                    ->where($foreignKeyColumn, $mergeId)
                    ->update([$foreignKeyColumn => $keepId]);

                if ($updated > 0) {
                    $this->logMessage("Updated {$updated} records in {$tableName} table for profile merge");
                }
            }
        }
    }

    /**
     * Log messages during migration
     */
    private function logMessage(string $message): void
    {
        echo $message . "\n";
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // This migration is not reversible as we're merging data
        // The duplicates would need to be recreated manually if needed
        $this->logMessage("This migration cannot be reversed - data has been merged and duplicates deleted");
    }
};