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
        // Add fund_uuid column to tables with direct fund_id foreign keys
        $tablesWithFundId = [
            'proposals',
            'campaigns', 
            'milestones',
            'proposal_milestones',
            'bookmark_collections',
        ];

        foreach ($tablesWithFundId as $table) {
            if (Schema::hasTable($table) && Schema::hasColumn($table, 'fund_id')) {
                Schema::table($table, function (Blueprint $table) {
                    $table->uuid('fund_uuid')->nullable()->after('fund_id');
                });
            }
        }

        // Add parent_uuid column to funds table for self-referencing relationship
        Schema::table('funds', function (Blueprint $table) {
            $table->uuid('parent_uuid')->nullable()->after('parent_id');
        });

        // Backfill fund_uuid columns by joining with funds table
        foreach ($tablesWithFundId as $tableName) {
            if (Schema::hasTable($tableName) && Schema::hasColumn($tableName, 'fund_id')) {
                DB::statement("
                    UPDATE {$tableName} 
                    SET fund_uuid = funds.uuid 
                    FROM funds 
                    WHERE {$tableName}.fund_id = funds.id 
                    AND {$tableName}.fund_id IS NOT NULL
                ");
            }
        }

        // Backfill parent_uuid in funds table
        DB::statement("
            UPDATE funds 
            SET parent_uuid = parent_funds.uuid 
            FROM funds AS parent_funds 
            WHERE funds.parent_id = parent_funds.id 
            AND funds.parent_id IS NOT NULL
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $tablesWithFundId = [
            'proposals',
            'campaigns', 
            'milestones',
            'proposal_milestones',
            'bookmark_collections',
        ];

        foreach ($tablesWithFundId as $table) {
            if (Schema::hasTable($table) && Schema::hasColumn($table, 'fund_uuid')) {
                Schema::table($table, function (Blueprint $table) {
                    $table->dropColumn('fund_uuid');
                });
            }
        }

        Schema::table('funds', function (Blueprint $table) {
            $table->dropColumn('parent_uuid');
        });
    }
};
