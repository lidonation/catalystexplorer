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
        // Add indexes for metrics table to optimize proposal metrics queries
        Schema::table('metrics', function (Blueprint $table) {
            // Index for type column used in getProposalMetrics
            $table->index('type', 'metrics_type_index');
            
            // Index for context column used in charts method
            $table->index('context', 'metrics_context_index');
            
            // Composite index for type and context if both are frequently queried together
            $table->index(['type', 'context'], 'metrics_type_context_index');
        });

        // Add indexes for metric rules table if it exists
        if (Schema::hasTable('metric_rules')) {
            Schema::table('metric_rules', function (Blueprint $table) {
                // Index for title column used in rule matching
                $table->index('title', 'metric_rules_title_index');
                
                // Index for metric_id for efficient joins
                $table->index('metric_id', 'metric_rules_metric_id_index');
                
                // Composite index for metric_id and title for exact matching
                $table->index(['metric_id', 'title'], 'metric_rules_metric_title_index');
            });
        }

        // Add indexes for proposals table to optimize filtering queries
        Schema::table('proposals', function (Blueprint $table) {
            // Indexes for common filter columns
            if (!Schema::hasIndex('proposals', 'proposals_status_index')) {
                $table->index('status', 'proposals_status_index');
            }
            
            if (!Schema::hasIndex('proposals', 'proposals_funding_status_index')) {
                $table->index('funding_status', 'proposals_funding_status_index');
            }
            
            if (!Schema::hasIndex('proposals', 'proposals_type_index')) {
                $table->index('type', 'proposals_type_index');
            }
            
            // Composite indexes for common filter combinations
            if (!Schema::hasIndex('proposals', 'proposals_status_funding_index')) {
                $table->index(['status', 'funding_status'], 'proposals_status_funding_index');
            }
            
            if (!Schema::hasIndex('proposals', 'proposals_type_status_index')) {
                $table->index(['type', 'status'], 'proposals_type_status_index');
            }
        });

        // Add indexes for proposal pivot tables if they exist
        $pivotTables = [
            'proposal_campaign',
            'proposal_tag', 
            'proposal_group',
            'proposal_community',
            'proposal_ideascale_profile',
            'proposal_fund'
        ];

        foreach ($pivotTables as $tableName) {
            if (Schema::hasTable($tableName)) {
                Schema::table($tableName, function (Blueprint $table) use ($tableName) {
                    $proposalColumn = 'proposal_id';
                    $otherColumn = str_replace('proposal_', '', $tableName) . '_id';
                    
                    // Add indexes for both columns if they don't exist
                    if (!Schema::hasIndex($tableName, $tableName . '_proposal_id_index')) {
                        $table->index($proposalColumn, $tableName . '_proposal_id_index');
                    }
                    
                    if (!Schema::hasIndex($tableName, $tableName . '_' . $otherColumn . '_index')) {
                        $table->index($otherColumn, $tableName . '_' . $otherColumn . '_index');
                    }
                });
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop indexes for metrics table
        Schema::table('metrics', function (Blueprint $table) {
            $table->dropIndex('metrics_type_index');
            $table->dropIndex('metrics_context_index');
            $table->dropIndex('metrics_type_context_index');
        });

        // Drop indexes for metric rules table if it exists
        if (Schema::hasTable('metric_rules')) {
            Schema::table('metric_rules', function (Blueprint $table) {
                $table->dropIndex('metric_rules_title_index');
                $table->dropIndex('metric_rules_metric_id_index');
                $table->dropIndex('metric_rules_metric_title_index');
            });
        }

        // Drop indexes for proposals table
        Schema::table('proposals', function (Blueprint $table) {
            $table->dropIndex('proposals_status_index');
            $table->dropIndex('proposals_funding_status_index');
            $table->dropIndex('proposals_type_index');
            $table->dropIndex('proposals_status_funding_index');
            $table->dropIndex('proposals_type_status_index');
        });

        // Drop indexes for pivot tables
        $pivotTables = [
            'proposal_campaign',
            'proposal_tag',
            'proposal_group', 
            'proposal_community',
            'proposal_ideascale_profile',
            'proposal_fund'
        ];

        foreach ($pivotTables as $tableName) {
            if (Schema::hasTable($tableName)) {
                Schema::table($tableName, function (Blueprint $table) use ($tableName) {
                    $otherColumn = str_replace('proposal_', '', $tableName) . '_id';
                    
                    $table->dropIndex($tableName . '_proposal_id_index');
                    $table->dropIndex($tableName . '_' . $otherColumn . '_index');
                });
            }
        }
    }
};
