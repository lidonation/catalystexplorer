<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Disable automatic transactions for this migration
     */
    public $withinTransaction = false;
    
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        echo "Starting migration of reviews.model_id to UUIDs\n";

        // Step 1: Check current data state
        $discussionReviews = DB::table('reviews')
            ->where('model_type', 'App\\Models\\Discussion')
            ->count();
        echo "Total Discussion reviews to migrate: $discussionReviews\n";

        // Step 2: Map Discussion reviews from old_id to UUID
        echo "Updating Discussion reviews with UUIDs...\n";
        $affected = DB::affectingStatement("
            UPDATE reviews 
            SET model_id = d.id::text
            FROM discussions d 
            WHERE reviews.model_type = 'App\\Models\\Discussion'
            AND reviews.model_id ~ '^[0-9]+$'
            AND reviews.model_id::integer = d.old_id
        ");
        echo "Updated $affected Discussion reviews with UUIDs\n";

        // Step 3: Remove all orphaned reviews that couldn't be mapped to valid UUIDs
        $orphanedReviews = DB::table('reviews')
            ->whereRaw('model_id ~ \'^[0-9]+$\'') // Still numeric
            ->count();

        if ($orphanedReviews > 0) {
            echo "Removing $orphanedReviews orphaned reviews (all model types)\n";
            // Get details of what we're removing
            $orphanedByType = DB::table('reviews')
                ->select('model_type', DB::raw('count(*) as count'))
                ->whereRaw('model_id ~ \'^[0-9]+$\'')
                ->groupBy('model_type')
                ->get();
            
            foreach ($orphanedByType as $type) {
                echo "  - {$type->model_type}: {$type->count} records\n";
            }
            
            DB::table('reviews')
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

        echo "Migration completed:\n";
        echo "- Final Discussion reviews count: $finalCount\n";
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
