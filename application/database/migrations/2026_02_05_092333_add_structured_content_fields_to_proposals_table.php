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
        Schema::table('proposals', function (Blueprint $table) {
            // Structured content fields stored as JSONB for efficient querying
            // pitch: {team: {who: "..."}, budget: {costs: "..."}, value: {note: "..."}}
            $table->jsonb('pitch')->nullable();

            // project_details: {solution: "...", impact: "...", feasibility: "..."}
            $table->jsonb('project_details')->nullable();

            // category_questions: {target: "...", activities: "...", performance_metrics: "..."}
            $table->jsonb('category_questions')->nullable();

            // theme: {group: "...", tag: "..."}
            $table->jsonb('theme')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('proposals', function (Blueprint $table) {
            $table->dropColumn(['pitch', 'project_details', 'category_questions', 'theme']);
        });
    }
};
