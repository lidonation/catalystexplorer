<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Drop the old constraint (still named with old table name)
        DB::statement('ALTER TABLE project_schedules DROP CONSTRAINT IF EXISTS proposal_milestones_status_check');
        
        // Clean up invalid status values before applying new constraint
        // Convert string 'null' and actual NULLs to 'active' as default
        DB::statement(
            "UPDATE project_schedules SET status = 'active' "
            . "WHERE status IS NULL OR status = 'null' OR status NOT IN ('active', 'paused', 'terminated', 'completed')"
        );
        
        // Add new constraint with updated status values
        DB::statement(
            "ALTER TABLE project_schedules ADD CONSTRAINT project_schedules_status_check "
            . "CHECK (status IN ('active', 'paused', 'terminated', 'completed'))"
        );
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop the new constraint
        DB::statement('ALTER TABLE project_schedules DROP CONSTRAINT IF EXISTS project_schedules_status_check');
        
        // Restore old constraint (without 'terminated')
        DB::statement(
            "ALTER TABLE project_schedules ADD CONSTRAINT proposal_milestones_status_check "
            . "CHECK (status IN ('active', 'paused', 'completed'))"
        );
    }
};
