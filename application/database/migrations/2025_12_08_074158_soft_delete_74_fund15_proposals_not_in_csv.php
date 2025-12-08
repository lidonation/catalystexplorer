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
     * This migration soft deletes 74 Fund 15 proposals that exist in the database
     * but are not included in the f15proposals.csv file.
     */
    public function up(): void
    {
        if (!app()->environment('production')) {
            \Illuminate\Support\Facades\Log::info('Migration skipped: delete_orphaned_catalyst_document_id_metas only runs in production environment');
            return;
        }

        // Read the UUIDs from the file
        $filePath = database_path('data/f15proposals_to_delete.txt');

        if (!file_exists($filePath)) {
            throw new Exception("File not found: {$filePath}");
        }

        $uuids = array_filter(array_map('trim', file($filePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES)));

        if (count($uuids) !== 69) {
            throw new Exception("Expected 74 UUIDs, found " . count($uuids));
        }

        // Validate UUIDs exist before soft deleting
        $existingCount = DB::table('proposals')
            ->whereIn('id', $uuids)
            ->whereNull('deleted_at')
            ->count();

        // Check if proposals are already soft deleted (likely by a previous migration)
        $alreadyDeletedCount = DB::table('proposals')
            ->whereIn('id', $uuids)
            ->whereNotNull('deleted_at')
            ->count();

        if ($existingCount === 0 && $alreadyDeletedCount > 0) {
            echo "Skipping migration: {$alreadyDeletedCount} proposals are already soft deleted (likely by a previous migration).\n";
            return;
        }

        if ($existingCount === 0) {
            throw new Exception("No proposals found with the provided UUIDs");
        }

        // Soft delete the proposals by setting deleted_at timestamp
        $deletedCount = DB::table('proposals')
            ->whereIn('id', $uuids)
            ->whereNull('deleted_at')
            ->update([
                'deleted_at' => now(),
                'updated_at' => now()
            ]);

        // Log the result
        echo "Soft deleted {$deletedCount} Fund 15 proposals out of {$existingCount} found.\n";

        if ($deletedCount !== $existingCount) {
            echo "Warning: Expected to delete {$existingCount} proposals but deleted {$deletedCount}.\n";
        }
    }

    /**
     * Reverse the migrations.
     *
     * This will restore (un-delete) the 74 Fund 15 proposals by setting
     * deleted_at back to NULL.
     */
    public function down(): void
    {
        // Read the UUIDs from the file
        $filePath = database_path('data/f15proposals_to_delete.txt');

        if (!file_exists($filePath)) {
            throw new Exception("File not found: {$filePath}");
        }

        $uuids = array_filter(array_map('trim', file($filePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES)));

        // Restore the soft deleted proposals
        $restoredCount = DB::table('proposals')
            ->whereIn('id', $uuids)
            ->whereNotNull('deleted_at')
            ->update([
                'deleted_at' => null,
                'updated_at' => now()
            ]);

        echo "Restored {$restoredCount} Fund 15 proposals from soft delete.\n";
    }
};
