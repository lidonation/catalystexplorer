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
        Schema::table('milestones', function (Blueprint $table) {
            // Rename the foreign key column to align with the new ProjectSchedule naming
            $table->renameColumn('proposal_milestone_id', 'project_schedule_id');
        });

        // Optionally rename the index for clarity (PostgreSQL specific)
        DB::statement("DO $$\n        BEGIN\n            IF EXISTS (\n                SELECT 1 FROM pg_indexes\n                WHERE schemaname = 'public' AND indexname = 'milestones_proposal_milestone_id_index'\n            ) THEN\n                ALTER INDEX milestones_proposal_milestone_id_index RENAME TO milestones_project_schedule_id_index;\n            END IF;\n        END$$;");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert index name first (if it was renamed)
        DB::statement("DO $$\n        BEGIN\n            IF EXISTS (\n                SELECT 1 FROM pg_indexes\n                WHERE schemaname = 'public' AND indexname = 'milestones_project_schedule_id_index'\n            ) THEN\n                ALTER INDEX milestones_project_schedule_id_index RENAME TO milestones_proposal_milestone_id_index;\n            END IF;\n        END$$;");

        Schema::table('milestones', function (Blueprint $table) {
            $table->renameColumn('project_schedule_id', 'proposal_milestone_id');
        });
    }
};