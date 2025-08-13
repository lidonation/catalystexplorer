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
        // Add group_uuid column to tables with direct group_id foreign keys
        $tablesWithGroupId = [
            'group_has_ideascale_profile',
            'group_has_proposal',
        ];

        foreach ($tablesWithGroupId as $table) {
            if (Schema::hasTable($table) && Schema::hasColumn($table, 'group_id')) {
                Schema::table($table, function (Blueprint $table) {
                    $table->uuid('group_uuid')->nullable()->after('group_id');
                });
            }
        }

        // Backfill group_uuid columns by joining with groups table
        foreach ($tablesWithGroupId as $tableName) {
            if (Schema::hasTable($tableName) && Schema::hasColumn($tableName, 'group_id')) {
                DB::statement("
                    UPDATE {$tableName} 
                    SET group_uuid = groups.uuid 
                    FROM groups 
                    WHERE {$tableName}.group_id = groups.id 
                    AND {$tableName}.group_id IS NOT NULL
                ");
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $tablesWithGroupId = [
            'group_has_ideascale_profile',
            'group_has_proposal',
        ];

        foreach ($tablesWithGroupId as $table) {
            if (Schema::hasTable($table) && Schema::hasColumn($table, 'group_uuid')) {
                Schema::table($table, function (Blueprint $table) {
                    $table->dropColumn('group_uuid');
                });
            }
        }
    }
};
