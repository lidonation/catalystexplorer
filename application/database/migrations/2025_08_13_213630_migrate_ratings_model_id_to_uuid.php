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
            echo "Starting migration of ratings.model_id to UUIDs\n";

            // Step 1: Check current data state
            $discussionRatings = DB::table('ratings')
                ->where('model_type', 'App\\Models\\Discussion')
                ->count();
            echo "Total Discussion ratings to migrate: $discussionRatings\n";

            // Step 2: Map Discussion ratings from old_id to UUID
            // Since ratings.model_id contains numeric strings and we need to map them to discussions.id (UUID)
            // We'll use discussions.old_id to map the numeric values
            $updatedDiscussions = DB::statement("
                UPDATE ratings 
                SET model_id = d.id::text
                FROM discussions d 
                WHERE ratings.model_type = 'App\\Models\\Discussion'
                AND ratings.model_id = d.old_id::text
            ");

            echo "Updated Discussion ratings with UUIDs\n";

            // Step 3: Remove orphaned ratings that couldn't be mapped
            $orphanedRatings = DB::table('ratings')
                ->where('model_type', 'App\\Models\\Discussion')
                ->whereRaw('model_id ~ \'^[0-9]+$\'') // Still numeric
                ->count();

            if ($orphanedRatings > 0) {
                echo "Removing $orphanedRatings orphaned Discussion ratings\n";
                DB::table('ratings')
                    ->where('model_type', 'App\\Models\\Discussion')
                    ->whereRaw('model_id ~ \'^[0-9]+$\'')
                    ->delete();
            }

            // Step 4: Convert model_id column from text to UUID type
            echo "Converting ratings.model_id column to UUID type\n";
            DB::statement('ALTER TABLE ratings ALTER COLUMN model_id TYPE UUID USING model_id::UUID');

            // Step 5: Verify the migration
            $finalCount = DB::table('ratings')
                ->where('model_type', 'App\\Models\\Discussion')
                ->count();

            $remainingNumeric = DB::table('ratings')
                ->where('model_type', 'App\\Models\\Discussion')
                ->whereRaw('model_id::text ~ \'^[0-9]+$\'')
                ->count();

            echo "Migration completed:\n";
            echo "- Final Discussion ratings count: $finalCount\n";
            echo "- Remaining numeric model_ids: $remainingNumeric\n";

            if ($remainingNumeric > 0) {
                throw new Exception("Migration failed: $remainingNumeric ratings still have numeric model_ids");
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::transaction(function () {
            // Convert UUID back to text first
            DB::statement('ALTER TABLE ratings ALTER COLUMN model_id TYPE TEXT USING model_id::TEXT');

            // Revert Discussion ratings back to old_id
            DB::statement("
                UPDATE ratings 
                SET model_id = d.old_id::text
                FROM discussions d 
                WHERE ratings.model_type = 'App\\Models\\Discussion'
                AND ratings.model_id = d.id::text
            ");

            echo "Reverted ratings.model_id back to numeric old_ids\n";
        });
    }
};
