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
        // Make campaign_uuid columns non-nullable and add indices
        $tablesWithCampaignId = [
            'proposals',
        ];

        foreach ($tablesWithCampaignId as $tableName) {
            if (Schema::hasTable($tableName) && Schema::hasColumn($tableName, 'campaign_uuid')) {
                Schema::table($tableName, function (Blueprint $table) use ($tableName) {
                    // Add index for performance first (works with nullable values)
                    $table->index('campaign_uuid', "{$tableName}_campaign_uuid_index");
                });
                
                // Only make non-nullable if there are no NULL values
                $nullCount = DB::table($tableName)->whereNull('campaign_uuid')->count();
                if ($nullCount === 0) {
                    Schema::table($tableName, function (Blueprint $table) {
                        // Make the UUID column non-nullable only if no NULL values exist
                        $table->uuid('campaign_uuid')->nullable(false)->change();
                    });
                }
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

        foreach ($tablesWithCampaignId as $tableName) {
            if (Schema::hasTable($tableName) && Schema::hasColumn($tableName, 'campaign_uuid')) {
                Schema::table($tableName, function (Blueprint $table) use ($tableName) {
                    // Drop the index first
                    $table->dropIndex("{$tableName}_campaign_uuid_index");
                    
                    // Make the UUID column nullable again
                    $table->uuid('campaign_uuid')->nullable()->change();
                });
            }
        }
    }
};
