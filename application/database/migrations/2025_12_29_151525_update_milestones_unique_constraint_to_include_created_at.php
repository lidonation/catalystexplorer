<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('milestones', function (Blueprint $table) {
            // Drop the old constraint that only used project_schedule_id and milestone
            $table->dropUnique('milestones_schedule_milestone_unique');
            
            // Add new constraint that includes created_at to allow multiple submissions per milestone number
            $table->unique(['project_schedule_id', 'milestone', 'created_at'], 'milestones_schedule_milestone_created_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('milestones', function (Blueprint $table) {
            $table->dropUnique('milestones_schedule_milestone_created_unique');
            $table->unique(['project_schedule_id', 'milestone'], 'milestones_schedule_milestone_unique');
        });
    }
};
