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
            echo "Starting migration of reviews.model_id to UUIDs\n";

            // Step 1: Check current data state
            $discussionReviews = DB::table('reviews')
                ->where('model_type', 'App\\Models\\Discussion')
                ->count();
            echo "Total Discussion reviews to migrate: $discussionReviews\n";

            // Step 2: Map Discussion reviews from old_id to UUID
            // Since reviews.model_id contains numeric strings and we need to map them to discussions.id (UUID)
            // We'll use discussions.old_id to map the numeric values
            DB::statement("
                UPDATE reviews 
                SET model_id = d.id::text
                FROM discussions d 
                WHERE reviews.model_type = 'App\\Models\\Discussion'
                AND reviews.model_id = d.old_id::text
            ");

            echo "Updated Discussion reviews with UUIDs\n";

            // Step 3: Remove orphaned reviews that couldn't be mapped
            $orphanedReviews = DB::table('reviews')
                ->where('model_type', 'App\\Models\\Discussion')
                ->whereRaw('model_id ~ \'^[0-9]+$\'') // Still numeric
                ->count();

            if ($orphanedReviews > 0) {
                echo "Removing $orphanedReviews orphaned Discussion reviews\n";
                DB::table('reviews')
                    ->where('model_type', 'App\\Models\\Discussion')
                    ->whereRaw('model_id ~ \'^[0-9]+$\'')
                    ->delete();
            }

            // Step 4: Convert model_id column from text to UUID type
            echo "Converting reviews.model_id column to UUID type\n";
            DB::statement('ALTER TABLE reviews ALTER COLUMN model_id TYPE UUID USING model_id::UUID');

            // Step 5: Verify the migration
            $finalCount = DB::table('reviews')
                ->where('model_type', 'App\\Models\\Discussion')
                ->count();

            $remainingNumeric = DB::table('reviews')
                ->where('model_type', 'App\\Models\\Discussion')
                ->whereRaw('model_id::text ~ \'^[0-9]+$\'')
                ->count();

            echo "Migration completed:\n";
            echo "- Final Discussion reviews count: $finalCount\n";
            echo "- Remaining numeric model_ids: $remainingNumeric\n";

            if ($remainingNumeric > 0) {
                throw new Exception("Migration failed: $remainingNumeric reviews still have numeric model_ids");
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
            DB::statement('ALTER TABLE reviews ALTER COLUMN model_id TYPE TEXT USING model_id::TEXT');

            // Revert Discussion reviews back to old_id
            DB::statement("
                UPDATE reviews 
                SET model_id = d.old_id::text
                FROM discussions d 
                WHERE reviews.model_type = 'App\\Models\\Discussion'
                AND reviews.model_id = d.id::text
            ");

            echo "Reverted reviews.model_id back to numeric old_ids\n";
        });
    }
};
