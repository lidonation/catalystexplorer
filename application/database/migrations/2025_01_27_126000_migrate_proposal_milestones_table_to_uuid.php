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
        // Step 1: Add new UUID columns to proposal_milestones table
        Schema::table('proposal_milestones', function (Blueprint $table) {
            $table->uuid('uuid')->nullable()->after('id');
            $table->bigInteger('old_id')->nullable()->after('uuid');
            
            // Add indexes for performance
            $table->index('uuid');
        });

        // Step 2: Generate UUIDs for existing proposal_milestones and backup old IDs
        DB::statement('UPDATE proposal_milestones SET uuid = gen_random_uuid(), old_id = id WHERE id IS NOT NULL');

        // Step 3: Update related tables to reference proposal_milestones UUIDs
        
        // Update milestones table to use UUID references
        Schema::table('milestones', function (Blueprint $table) {
            $table->uuid('proposal_milestone_uuid')->nullable()->after('proposal_milestone_id');
            $table->index('proposal_milestone_uuid');
        });

        DB::statement("
            UPDATE milestones 
            SET proposal_milestone_uuid = proposal_milestones.uuid
            FROM proposal_milestones 
            WHERE milestones.proposal_milestone_id = proposal_milestones.old_id
              AND milestones.proposal_milestone_id IS NOT NULL
        ");

        // Handle orphaned milestone references (set them to NULL)
        $orphanedMilestones = DB::scalar('
            SELECT COUNT(*) FROM milestones 
            WHERE proposal_milestone_id IS NOT NULL AND proposal_milestone_uuid IS NULL
        ');
        
        if ($orphanedMilestones > 0) {
            // Log the orphaned references for information
            echo "Found {$orphanedMilestones} orphaned milestone references. Setting them to NULL.\n";
            
            // Set orphaned references to NULL
            DB::statement('
                UPDATE milestones 
                SET proposal_milestone_id = NULL
                WHERE proposal_milestone_id IS NOT NULL AND proposal_milestone_uuid IS NULL
            ');
        }

        // Step 4: Make UUID columns non-nullable for proposal_milestones
        // Keep proposal_milestone_uuid nullable in milestones since some may be orphaned
        Schema::table('proposal_milestones', function (Blueprint $table) {
            $table->uuid('uuid')->nullable(false)->change();
        });

        // Note: proposal_milestone_uuid stays nullable due to orphaned references

        // Step 5: Create new UUID primary key for proposal_milestones
        // Note: proposal_milestones table had no primary key originally
        Schema::table('proposal_milestones', function (Blueprint $table) {
            $table->primary('uuid');
        });

        // Step 6: Drop old columns
        Schema::table('proposal_milestones', function (Blueprint $table) {
            $table->dropColumn('id');
        });

        Schema::table('milestones', function (Blueprint $table) {
            $table->dropColumn('proposal_milestone_id');
        });

        // Step 7: Rename columns to final names
        Schema::table('proposal_milestones', function (Blueprint $table) {
            $table->renameColumn('uuid', 'id');
        });

        Schema::table('milestones', function (Blueprint $table) {
            $table->renameColumn('proposal_milestone_uuid', 'proposal_milestone_id');
        });

        // Step 8: Update indexes for renamed columns
        DB::statement('DROP INDEX IF EXISTS proposal_milestones_uuid_index');
        DB::statement('DROP INDEX IF EXISTS milestones_proposal_milestone_uuid_index');

        DB::statement('CREATE INDEX proposal_milestones_id_index ON proposal_milestones (id)');
        DB::statement('CREATE INDEX milestones_proposal_milestone_id_index ON milestones (proposal_milestone_id)');
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
