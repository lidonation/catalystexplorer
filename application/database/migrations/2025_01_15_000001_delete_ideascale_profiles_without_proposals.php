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
            $this->logMessage("Starting cleanup of IdeascaleProfile records with zero proposal relations...");

            // First, let's get some stats before deletion
            $totalProfiles = DB::table('ideascale_profiles')->count();
            $this->logMessage("Total IdeascaleProfile records before cleanup: {$totalProfiles}");

            // Find profiles with no proposal relationships
            $profilesWithoutProposals = DB::table('ideascale_profiles')
                ->leftJoin('proposal_profiles', function ($join) {
                    $join->on('ideascale_profiles.id', '=', 'proposal_profiles.profile_id')
                         ->where('proposal_profiles.profile_type', '=', 'App\\Models\\IdeascaleProfile');
                })
                ->whereNull('proposal_profiles.profile_id')
                ->pluck('ideascale_profiles.id');

            $this->logMessage("Found " . count($profilesWithoutProposals) . " IdeascaleProfile records with zero proposal relations");

            if ($profilesWithoutProposals->isEmpty()) {
                $this->logMessage("No profiles to delete. Migration complete.");
                return;
            }

            // Before deletion, let's clean up any related data for these profiles
            $this->cleanupRelatedData($profilesWithoutProposals->toArray());

            // Delete the profiles without proposals
            $deletedCount = DB::table('ideascale_profiles')
                ->whereIn('id', $profilesWithoutProposals)
                ->delete();

            $this->logMessage("Successfully deleted {$deletedCount} IdeascaleProfile records with zero proposal relations");

            // Final stats
            $remainingProfiles = DB::table('ideascale_profiles')->count();
            $this->logMessage("Remaining IdeascaleProfile records after cleanup: {$remainingProfiles}");
            $this->logMessage("Total records deleted: " . ($totalProfiles - $remainingProfiles));
        });
    }

    /**
     * Clean up related data for profiles that will be deleted
     */
    private function cleanupRelatedData(array $profileIds): void
    {
        if (empty($profileIds)) {
            return;
        }

        $this->logMessage("Cleaning up related data for " . count($profileIds) . " profiles...");

        // Clean up group relationships
        $groupRelationsDeleted = DB::table('group_has_ideascale_profile')
            ->whereIn('ideascale_profile_id', $profileIds)
            ->delete();
        
        if ($groupRelationsDeleted > 0) {
            $this->logMessage("Deleted {$groupRelationsDeleted} group relationships");
        }

        // Clean up monthly reports
        $monthlyReportsDeleted = DB::table('monthly_reports')
            ->whereIn('ideascale_profile_id', $profileIds)
            ->delete();
        
        if ($monthlyReportsDeleted > 0) {
            $this->logMessage("Deleted {$monthlyReportsDeleted} monthly reports");
        }

        // Clean up NFTs
        $nftsDeleted = DB::table('nfts')
            ->where('model_type', 'App\\Models\\IdeascaleProfile')
            ->whereIn('model_id', $profileIds)
            ->delete();
        
        if ($nftsDeleted > 0) {
            $this->logMessage("Deleted {$nftsDeleted} NFT records");
        }

        // Clean up any legacy proposal relationships (if table exists)
        if (Schema::hasTable('ideascale_profile_has_proposal')) {
            $legacyRelationsDeleted = DB::table('ideascale_profile_has_proposal')
                ->whereIn('ideascale_profile_id', $profileIds)
                ->delete();
            
            if ($legacyRelationsDeleted > 0) {
                $this->logMessage("Deleted {$legacyRelationsDeleted} legacy proposal relationships");
            }
        }

        // Clean up media library associations (if using Spatie Media Library)
        if (Schema::hasTable('media')) {
            $mediaDeleted = DB::table('media')
                ->where('model_type', 'App\\Models\\IdeascaleProfile')
                ->whereIn('model_id', $profileIds)
                ->delete();
            
            if ($mediaDeleted > 0) {
                $this->logMessage("Deleted {$mediaDeleted} media records");
            }
        }

        // Clean up metadata (if using the HasMetaData trait)
        if (Schema::hasTable('metas')) {
            $metasDeleted = DB::table('metas')
                ->where('model_type', 'App\\Models\\IdeascaleProfile')
                ->whereIn('model_id', $profileIds)
                ->delete();
            
            if ($metasDeleted > 0) {
                $this->logMessage("Deleted {$metasDeleted} metadata records");
            }
        }

        // Clean up any other tables that might reference these profile IDs
        $this->cleanupGenericForeignKeyReferences($profileIds, 'ideascale_profile_id');
        $this->cleanupGenericForeignKeyReferences($profileIds, 'ideascale_profile_uuid');
    }

    /**
     * Generic cleanup for foreign key references
     */
    private function cleanupGenericForeignKeyReferences(array $profileIds, string $foreignKeyColumn): void
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
            
            // Skip tables we've already handled specifically or the main table
            if (in_array($tableName, [
                'ideascale_profiles',
                'group_has_ideascale_profile', 
                'monthly_reports',
                'ideascale_profile_has_proposal',
                'nfts',
                'media',
                'metas'
            ])) {
                continue;
            }

            // Delete records that reference the profiles being deleted
            $deleted = DB::table($tableName)
                ->whereIn($foreignKeyColumn, $profileIds)
                ->delete();

            if ($deleted > 0) {
                $this->logMessage("Deleted {$deleted} records from {$tableName} table");
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
        // This migration is not reversible as we're deleting data
        // The deleted profiles would need to be restored from backup if needed
        $this->logMessage("This migration cannot be reversed - IdeascaleProfile records have been permanently deleted");
        $this->logMessage("If you need to restore deleted profiles, you'll need to restore from a database backup");
    }
};