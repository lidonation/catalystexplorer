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
        // Make ideascale_profile_uuid columns non-nullable and add indices
        $tablesWithIdeascaleProfileId = [
            'group_has_ideascale_profile',
            'ideascale_profile_has_proposal',
            'monthly_reports',
            'community_has_ideascale_profile',
        ];

        foreach ($tablesWithIdeascaleProfileId as $tableName) {
            if (Schema::hasTable($tableName) && Schema::hasColumn($tableName, 'ideascale_profile_uuid')) {
                Schema::table($tableName, function (Blueprint $table) use ($tableName) {
                    // Make the UUID column non-nullable
                    $table->uuid('ideascale_profile_uuid')->nullable(false)->change();
                    
                    // Add index for performance
                    $table->index('ideascale_profile_uuid', "{$tableName}_ideascale_profile_uuid_index");
                });
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $tablesWithIdeascaleProfileId = [
            'group_has_ideascale_profile',
            'ideascale_profile_has_proposal',
            'monthly_reports',
            'community_has_ideascale_profile',
        ];

        foreach ($tablesWithIdeascaleProfileId as $tableName) {
            if (Schema::hasTable($tableName) && Schema::hasColumn($tableName, 'ideascale_profile_uuid')) {
                Schema::table($tableName, function (Blueprint $table) use ($tableName) {
                    // Drop the index first
                    $table->dropIndex("{$tableName}_ideascale_profile_uuid_index");
                    
                    // Make the UUID column nullable again
                    $table->uuid('ideascale_profile_uuid')->nullable()->change();
                });
            }
        }
    }
};
