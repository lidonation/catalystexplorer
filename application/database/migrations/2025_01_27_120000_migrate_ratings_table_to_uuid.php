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
        // Step 1: Add new UUID columns
        Schema::table('ratings', function (Blueprint $table) {
            $table->uuid('uuid')->nullable()->after('id');
            $table->bigInteger('old_id')->nullable()->after('uuid');
            $table->text('model_uuid')->nullable()->after('model_id');
            
            // Add index on new UUID column for performance
            $table->index('uuid');
            $table->index('model_uuid');
        });

        // Step 2: Generate UUIDs for existing records and backup old IDs
        DB::statement('UPDATE ratings SET uuid = gen_random_uuid(), old_id = id');

        // Step 3: Convert model_id references from old bigint to UUIDs
        // All ratings reference Discussion models, so we can join directly
        // Since discussions table still uses bigint IDs, we join on id directly
        DB::statement("
            UPDATE ratings 
            SET model_uuid = discussions.id::text
            FROM discussions 
            WHERE ratings.model_id = discussions.id
              AND ratings.model_type = 'App\\Models\\Discussion'
        ");

        // Verify all records were updated
        $unmapped = DB::scalar('SELECT COUNT(*) FROM ratings WHERE model_uuid IS NULL');
        if ($unmapped > 0) {
            throw new Exception("Failed to map {$unmapped} ratings.model_id values to UUIDs");
        }

        // Step 4: Make UUID columns non-nullable
        Schema::table('ratings', function (Blueprint $table) {
            $table->uuid('uuid')->nullable(false)->change();
            $table->text('model_uuid')->nullable(false)->change();
        });

        // Step 5: Drop dependent materialized view before modifying columns
        DB::statement('DROP MATERIALIZED VIEW IF EXISTS _proposal_ratings');

        // Step 6: Drop old primary key and create new UUID primary key
        Schema::table('ratings', function (Blueprint $table) {
            $table->dropPrimary('ratings_pkey');
        });

        Schema::table('ratings', function (Blueprint $table) {
            $table->primary('uuid');
        });

        // Step 7: Drop old columns
        Schema::table('ratings', function (Blueprint $table) {
            $table->dropColumn(['id', 'model_id']);
        });

        // Step 7: Rename columns to final names
        Schema::table('ratings', function (Blueprint $table) {
            $table->renameColumn('uuid', 'id');
            $table->renameColumn('model_uuid', 'model_id');
        });

        // Step 8: Update indexes for renamed columns
        DB::statement('DROP INDEX IF EXISTS ratings_uuid_index');
        DB::statement('DROP INDEX IF EXISTS ratings_model_uuid_index');
        DB::statement('CREATE INDEX ratings_id_index ON ratings (id)');
        DB::statement('CREATE INDEX ratings_model_id_index ON ratings (model_id)');

        // Step 9: Recreate the materialized view with updated column references
        DB::statement("
            CREATE MATERIALIZED VIEW _proposal_ratings AS
            SELECT ratings.id,
                ratings.rating,
                reviews.*::reviews AS reviews,
                reviews.content AS rationale,
                reviews.id AS assessment_id,
                discussions.id AS discussion_id,
                discussions.content AS discussion,
                proposals.id AS proposal_id,
                proposals.fund_id,
                proposals.status,
                proposals.user_id AS primary_author
            FROM (((ratings
                LEFT JOIN discussions ON (((ratings.model_id = discussions.id::text) AND (ratings.model_type = 'App\\Models\\Discussion'::text))))
                LEFT JOIN reviews ON ((ratings.review_id = reviews.id)))
                RIGHT JOIN proposals ON (((discussions.model_id = proposals.id) AND ((discussions.model_type)::text = 'App\\Models\\Proposal'::text))));
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Step 1: Add back old columns
        Schema::table('ratings', function (Blueprint $table) {
            $table->bigIncrements('new_id')->first();
            $table->bigInteger('new_model_id')->nullable()->after('model_id');
        });

        // Step 2: Restore old ID values and map back model_id references
        DB::statement('UPDATE ratings SET new_id = old_id');
        
        // Map UUID model_id back to old bigint discussion IDs
        DB::statement("
            UPDATE ratings 
            SET new_model_id = discussions.id
            FROM discussions 
            WHERE ratings.model_id = discussions.id::text
              AND ratings.model_type = 'App\\Models\\Discussion'
        ");

        // Step 3: Drop UUID primary key
        Schema::table('ratings', function (Blueprint $table) {
            $table->dropPrimary(['id']);
        });

        // Step 4: Drop UUID columns
        Schema::table('ratings', function (Blueprint $table) {
            $table->dropColumn(['id', 'model_id', 'old_id']);
        });

        // Step 5: Rename columns back to original names
        Schema::table('ratings', function (Blueprint $table) {
            $table->renameColumn('new_id', 'id');
            $table->renameColumn('new_model_id', 'model_id');
        });

        // Step 6: Restore original primary key
        Schema::table('ratings', function (Blueprint $table) {
            $table->primary('id');
        });
    }
};
