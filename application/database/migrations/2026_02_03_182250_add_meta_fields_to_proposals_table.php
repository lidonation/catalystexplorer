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
            // Ideascale reference
            $table->bigInteger('ideascale_id')->nullable()->index();

            // Review scores (moved from metas for query performance)
            $table->decimal('alignment_score', 3, 1)->nullable();
            $table->decimal('feasibility_score', 3, 1)->nullable();
            $table->decimal('auditability_score', 3, 1)->nullable();

            // Blockchain references
            $table->string('chain_proposal_id')->nullable()->index();
            $table->integer('chain_proposal_index')->nullable();

            // Vote statistics
            $table->integer('unique_wallets')->nullable();
            $table->integer('yes_wallets')->nullable();
            $table->integer('no_wallets')->nullable();

            // Translation metadata
            $table->boolean('is_auto_translated')->default(false);
            $table->string('original_language', 10)->nullable();

            // Dependencies
            $table->boolean('has_dependencies')->default(false);
            $table->text('dependencies_description')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('proposals', function (Blueprint $table) {
            $table->dropColumn([
                'ideascale_id',
                'alignment_score',
                'feasibility_score',
                'auditability_score',
                'chain_proposal_id',
                'chain_proposal_index',
                'unique_wallets',
                'yes_wallets',
                'no_wallets',
                'is_auto_translated',
                'original_language',
                'has_dependencies',
                'dependencies_description',
            ]);
        });
    }
};
