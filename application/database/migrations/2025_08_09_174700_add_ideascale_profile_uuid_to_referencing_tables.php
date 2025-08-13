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
        // Add ideascale_profile_uuid column to tables with direct ideascale_profile_id foreign keys
        $tablesWithIdeascaleProfileId = [
            'group_has_ideascale_profile',
            'ideascale_profile_has_proposal',
            'monthly_reports',
            'community_has_ideascale_profile',
        ];

        foreach ($tablesWithIdeascaleProfileId as $table) {
            if (Schema::hasTable($table) && Schema::hasColumn($table, 'ideascale_profile_id') && !Schema::hasColumn($table, 'ideascale_profile_uuid')) {
                Schema::table($table, function (Blueprint $table) {
                    $table->uuid('ideascale_profile_uuid')->nullable()->after('ideascale_profile_id');
                });
            }
        }

        // Backfill ideascale_profile_uuid columns by joining with ideascale_profiles table
        foreach ($tablesWithIdeascaleProfileId as $tableName) {
            if (Schema::hasTable($tableName) && Schema::hasColumn($tableName, 'ideascale_profile_id')) {
                DB::statement("
                    UPDATE {$tableName} 
                    SET ideascale_profile_uuid = ideascale_profiles.uuid 
                    FROM ideascale_profiles 
                    WHERE {$tableName}.ideascale_profile_id = ideascale_profiles.id 
                    AND {$tableName}.ideascale_profile_id IS NOT NULL
                ");
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

        foreach ($tablesWithIdeascaleProfileId as $table) {
            if (Schema::hasTable($table) && Schema::hasColumn($table, 'ideascale_profile_uuid')) {
                Schema::table($table, function (Blueprint $table) {
                    $table->dropColumn('ideascale_profile_uuid');
                });
            }
        }
    }
};
