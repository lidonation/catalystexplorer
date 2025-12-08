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
        // Only run this migration in production environment
        if (!app()->environment('production')) {
            \Illuminate\Support\Facades\Log::info('Migration skipped: delete_orphaned_catalyst_document_id_metas only runs in production environment');
            return;
        }

        // Count records before deletion for logging
        $nullModelIdCount = DB::table('metas')
            ->where('key', 'catalyst_document_id')
            ->whereNull('model_id')
            ->count();

        $orphanedCount = DB::table('metas')
            ->where('key', 'catalyst_document_id')
            ->whereNotNull('model_id')
            ->whereNotExists(function ($query) {
                $query->select(DB::raw(1))
                    ->from('proposals')
                    ->whereRaw('proposals.id = metas.model_id');
            })
            ->count();

        // Log the counts for reference
        \Illuminate\Support\Facades\Log::info('Deleting orphaned catalyst_document_id metas', [
            'null_model_id_count' => $nullModelIdCount,
            'orphaned_count' => $orphanedCount,
            'total_to_delete' => $nullModelIdCount + $orphanedCount
        ]);

        // Delete metas with key 'catalyst_document_id' where model_id is null
        DB::table('metas')
            ->where('key', 'catalyst_document_id')
            ->whereNull('model_id')
            ->delete();

        // Delete metas with key 'catalyst_document_id' where model_id doesn't exist in proposals table
        DB::table('metas')
            ->where('key', 'catalyst_document_id')
            ->whereNotNull('model_id')
            ->whereNotExists(function ($query) {
                $query->select(DB::raw(1))
                    ->from('proposals')
                    ->whereRaw('proposals.id = metas.model_id');
            })
            ->delete();

        \Illuminate\Support\Facades\Log::info('Completed deletion of orphaned catalyst_document_id metas');
    }

    /**
     * Reverse the migrations.
     *
     * Note: This migration cannot be safely reversed as the deleted data
     * cannot be reconstructed without the original source.
     */
    public function down(): void
    {
        // Only run this rollback in production environment
        if (!app()->environment('production')) {
            \Illuminate\Support\Facades\Log::info('Migration rollback skipped: delete_orphaned_catalyst_document_id_metas only runs in production environment');
            return;
        }

        // This migration cannot be reversed as we're deleting orphaned data
        // that has no valid relationship. The data cannot be reconstructed.
        \Illuminate\Support\Facades\Log::warning('Migration cannot be reversed: orphaned metas data was permanently deleted');
    }
};
