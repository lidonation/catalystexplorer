<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // First, remove any duplicate milestones before adding the constraint
        DB::statement("
            DELETE FROM milestones a USING milestones b 
            WHERE a.id > b.id 
            AND a.project_schedule_id = b.project_schedule_id 
            AND a.milestone = b.milestone
        ");

        Schema::table('milestones', function (Blueprint $table) {
            // Add unique constraint on project_schedule_id and milestone number
            $table->unique(['project_schedule_id', 'milestone'], 'milestones_schedule_milestone_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('milestones', function (Blueprint $table) {
            $table->dropUnique('milestones_schedule_milestone_unique');
        });
    }
};
