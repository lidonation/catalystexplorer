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
        // Step 1: Add new UUID columns to milestones table
        Schema::table('milestones', function (Blueprint $table) {
            $table->uuid('uuid')->nullable()->after('id');
            $table->bigInteger('old_id')->nullable()->after('uuid');
            $table->text('proposal_uuid')->nullable()->after('proposal_id');
            
            // Add indexes for performance
            $table->index('uuid');
            $table->index('proposal_uuid');
        });

        // Step 2: Generate UUIDs for existing milestones and backup old IDs
        DB::statement('UPDATE milestones SET uuid = gen_random_uuid(), old_id = id');

        // Step 3: Convert proposal_id references from old bigint to UUIDs
        // Since proposals table still uses bigint IDs, we join on id directly
        DB::statement("
            UPDATE milestones 
            SET proposal_uuid = proposals.id::text
            FROM proposals 
            WHERE milestones.proposal_id = proposals.id
              AND milestones.proposal_id IS NOT NULL
        ");

        // Verify all proposal references were updated
        $unmapped_proposals = DB::scalar('
            SELECT COUNT(*) FROM milestones 
            WHERE proposal_id IS NOT NULL AND proposal_uuid IS NULL
        ');
        if ($unmapped_proposals > 0) {
            throw new Exception("Failed to map {$unmapped_proposals} milestones.proposal_id values to UUIDs");
        }

        // Step 4: Update related tables to reference milestone UUIDs
        
        // Update milestone_poas table
        Schema::table('milestone_poas', function (Blueprint $table) {
            $table->uuid('milestone_uuid')->nullable()->after('milestone_id');
            $table->index('milestone_uuid');
        });

        DB::statement("
            UPDATE milestone_poas 
            SET milestone_uuid = milestones.uuid
            FROM milestones 
            WHERE milestone_poas.milestone_id = milestones.old_id
        ");

        // Update milestone_som_reviews table
        Schema::table('milestone_som_reviews', function (Blueprint $table) {
            $table->uuid('milestone_uuid')->nullable()->after('milestone_id');
            $table->index('milestone_uuid');
        });

        DB::statement("
            UPDATE milestone_som_reviews 
            SET milestone_uuid = milestones.uuid
            FROM milestones 
            WHERE milestone_som_reviews.milestone_id = milestones.old_id
        ");

        // Step 5: Make UUID columns non-nullable
        Schema::table('milestones', function (Blueprint $table) {
            $table->uuid('uuid')->nullable(false)->change();
        });

        Schema::table('milestone_poas', function (Blueprint $table) {
            $table->uuid('milestone_uuid')->nullable(false)->change();
        });

        Schema::table('milestone_som_reviews', function (Blueprint $table) {
            $table->uuid('milestone_uuid')->nullable(false)->change();
        });

        // Step 6: Create new UUID primary key for milestones
        // Note: milestones table had no primary key originally
        Schema::table('milestones', function (Blueprint $table) {
            $table->primary('uuid');
        });

        // Step 7: Drop old columns
        Schema::table('milestones', function (Blueprint $table) {
            $table->dropColumn(['id', 'proposal_id']);
        });

        Schema::table('milestone_poas', function (Blueprint $table) {
            $table->dropColumn('milestone_id');
        });

        Schema::table('milestone_som_reviews', function (Blueprint $table) {
            $table->dropColumn('milestone_id');
        });

        // Step 8: Rename columns to final names
        Schema::table('milestones', function (Blueprint $table) {
            $table->renameColumn('uuid', 'id');
            $table->renameColumn('proposal_uuid', 'proposal_id');
        });

        Schema::table('milestone_poas', function (Blueprint $table) {
            $table->renameColumn('milestone_uuid', 'milestone_id');
        });

        Schema::table('milestone_som_reviews', function (Blueprint $table) {
            $table->renameColumn('milestone_uuid', 'milestone_id');
        });

        // Step 9: Update indexes for renamed columns
        DB::statement('DROP INDEX IF EXISTS milestones_uuid_index');
        DB::statement('DROP INDEX IF EXISTS milestones_proposal_uuid_index');
        DB::statement('DROP INDEX IF EXISTS milestone_poas_milestone_uuid_index');
        DB::statement('DROP INDEX IF EXISTS milestone_som_reviews_milestone_uuid_index');

        DB::statement('CREATE INDEX milestones_id_index ON milestones (id)');
        DB::statement('CREATE INDEX milestones_proposal_id_index ON milestones (proposal_id)');
        DB::statement('CREATE INDEX milestone_poas_milestone_id_index ON milestone_poas (milestone_id)');
        DB::statement('CREATE INDEX milestone_som_reviews_milestone_id_index ON milestone_som_reviews (milestone_id)');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // This is a complex rollback - implement if needed
        throw new Exception('Migration rollback not implemented due to complexity. Use database backup if rollback needed.');
    }
};
