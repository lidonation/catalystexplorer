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
        Schema::table('project_schedules', function (Blueprint $table) {
            // Add column to store the API's proposal ID (integer) for fetching milestones
            $table->bigInteger('api_proposal_id')->nullable()->after('project_id');
            $table->index('api_proposal_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('project_schedules', function (Blueprint $table) {
            $table->dropIndex(['api_proposal_id']);
            $table->dropColumn('api_proposal_id');
        });
    }
};
