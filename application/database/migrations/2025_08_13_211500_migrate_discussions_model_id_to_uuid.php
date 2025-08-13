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
            // Step 1: Convert BookmarkCollection numeric model_ids to UUIDs
            DB::statement("
                UPDATE discussions 
                SET model_id = bc.id::text
                FROM bookmark_collections bc 
                WHERE discussions.model_type = 'App\\Models\\BookmarkCollection'
                AND discussions.model_id = bc.old_id::text
            ");

            // Step 2: Convert Review numeric model_ids to UUIDs  
            DB::statement("
                UPDATE discussions 
                SET model_id = r.id::text
                FROM reviews r 
                WHERE discussions.model_type = 'App\\Models\\Review'
                AND discussions.model_id = r.old_id::text
            ");

            // Step 3: Remove orphaned discussions that couldn't be mapped
            $orphanedBC = DB::table('discussions')
                ->where('model_type', 'App\\Models\\BookmarkCollection')
                ->whereRaw('model_id ~ \'^[0-9]+$\'')
                ->count();

            $orphanedReviews = DB::table('discussions')
                ->where('model_type', 'App\\Models\\Review')
                ->whereRaw('model_id ~ \'^[0-9]+$\'')
                ->count();

            if ($orphanedBC > 0) {
                echo "Removing $orphanedBC orphaned BookmarkCollection discussions\n";
                DB::table('discussions')
                    ->where('model_type', 'App\\Models\\BookmarkCollection')
                    ->whereRaw('model_id ~ \'^[0-9]+$\'')
                    ->delete();
            }

            if ($orphanedReviews > 0) {
                echo "Removing $orphanedReviews orphaned Review discussions\n";
                DB::table('discussions')
                    ->where('model_type', 'App\\Models\\Review')
                    ->whereRaw('model_id ~ \'^[0-9]+$\'')
                    ->delete();
            }

            // Step 4: Verify conversion success
            $remainingNumeric = DB::table('discussions')
                ->whereRaw('model_id ~ \'^[0-9]+$\'')
                ->count();

            if ($remainingNumeric > 0) {
                throw new Exception("Migration failed: $remainingNumeric discussions still have numeric model_ids");
            }

            echo "Successfully migrated discussions.model_id to UUIDs\n";
            echo "Updated BookmarkCollection discussions: " . 
                DB::table('discussions')->where('model_type', 'App\\Models\\BookmarkCollection')->count() . "\n";
            echo "Updated Review discussions: " . 
                DB::table('discussions')->where('model_type', 'App\\Models\\Review')->count() . "\n";
            echo "Proposal discussions (already UUID): " . 
                DB::table('discussions')->where('model_type', 'App\\Models\\Proposal')->count() . "\n";
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::transaction(function () {
            // Revert BookmarkCollection UUIDs back to numeric old_ids
            DB::statement("
                UPDATE discussions 
                SET model_id = bc.old_id::text
                FROM bookmark_collections bc 
                WHERE discussions.model_type = 'App\\Models\\BookmarkCollection'
                AND discussions.model_id = bc.id::text
            ");

            // Revert Review UUIDs back to numeric old_ids
            DB::statement("
                UPDATE discussions 
                SET model_id = r.old_id::text
                FROM reviews r 
                WHERE discussions.model_type = 'App\\Models\\Review'
                AND discussions.model_id = r.id::text
            ");

            echo "Reverted discussions.model_id back to numeric old_ids\n";
        });
    }
};
