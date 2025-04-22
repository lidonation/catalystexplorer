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
        Schema::create('cardano_budget_proposals', function (Blueprint $table) {
            $table->id();

            $table->bigInteger('govtool_user_id');
            $table->bigInteger('govtool_proposal_id');
            $table->tinyText('govtool_username');
            $table->tinyText('proposal_name');
            $table->tinyText('budget_cat');

            $table->boolean('is_active');
            $table->boolean('privacy_policy');
            $table->boolean('intersect_named_administrator');
            $table->integer('prop_comments_number');
            $table->float('ada_amount');
            $table->float('amount_in_preferred_currency');
            $table->float('usd_to_ada_conversion_rate');

            $table->timestamps();

            $table->text('intersect_admin_further_text')->nullable();
            $table->text('cost_breakdown');
            $table->text('problem_statement');
            $table->text('proposal_benefit');
            $table->text('supplementary_endorsement')->nullable();
            $table->text('explain_proposal_roadmap');
            $table->text('experience');
            $table->text('maintain_and_support');
            $table->text('proposal_description');
            $table->text('key_proposal_deliverables');
            $table->text('resourcing_duration_estimates');
            $table->text('other_contract_type')->nullable();
            $table->text('key_dependencies');

            $table->softDeletes();

            $table->index('govtool_username');
            $table->index('govtool_user_id');
            $table->index('govtool_proposal_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cardano_budget_proposals');
    }
};
