<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add campaign_uuid column to tables with direct campaign_id foreign keys
        $tablesWithCampaignId = [
            'proposals',
        ];

        foreach ($tablesWithCampaignId as $table) {
            if (Schema::hasTable($table) && Schema::hasColumn($table, 'campaign_id')) {
                Schema::table($table, function (Blueprint $table) {
                    $table->uuid('campaign_uuid')->nullable()->after('campaign_id');
                });
            }
        }

        // Backfill campaign_uuid columns by joining with campaigns table
        foreach ($tablesWithCampaignId as $tableName) {
            if (Schema::hasTable($tableName) && Schema::hasColumn($tableName, 'campaign_id')) {
                DB::statement("
                    UPDATE {$tableName} 
                    SET campaign_uuid = campaigns.uuid 
                    FROM campaigns 
                    WHERE {$tableName}.campaign_id = campaigns.id 
                    AND {$tableName}.campaign_id IS NOT NULL
                ");
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $tablesWithCampaignId = [
            'proposals',
        ];

        foreach ($tablesWithCampaignId as $table) {
            if (Schema::hasTable($table) && Schema::hasColumn($table, 'campaign_uuid')) {
                Schema::table($table, function (Blueprint $table) {
                    $table->dropColumn('campaign_uuid');
                });
            }
        }
    }
};
