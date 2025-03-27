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
        Schema::table('proposal_milestones', function (Blueprint $table) {
            $table->renameColumn('milestones_qty', 'milestone_count');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('proposal_milestones', function (Blueprint $table) {
            $table->renameColumn('milestone_count', 'milestones_qty');
        });
    }
};
