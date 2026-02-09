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
        Schema::table('campaigns', function (Blueprint $table) {
            // Structured category details stored as JSONB
            // {
            //   overview: "...",
            //   budget_constraints: {...},
            //   areas_of_interest: [...],
            //   who_should_apply: "...",
            //   defining_criteria: "...",
            //   proposal_guidance: "...",
            //   self_assessment_checklist: "..."
            // }
            $table->jsonb('category_details')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('campaigns', function (Blueprint $table) {
            $table->dropColumn('category_details');
        });
    }
};
