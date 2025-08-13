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
        // Remove old integer columns after successful UUID migration
        Schema::table('groups', function (Blueprint $table) {
            $table->dropColumn('old_id');
        });

        $tables = ['group_has_ideascale_profile', 'group_has_proposal'];
        
        foreach ($tables as $tableName) {
            if (Schema::hasTable($tableName) && Schema::hasColumn($tableName, 'old_group_id')) {
                try {
                    Schema::table($tableName, function (Blueprint $table) {
                        $table->dropColumn('old_group_id');
                    });
                } catch (\Exception $e) {
                    // If there are dependencies, use CASCADE
                    DB::statement("ALTER TABLE {$tableName} DROP COLUMN old_group_id CASCADE");
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // This migration is not easily reversible since we're dropping data
        // If rollback is needed, restore from backup before this migration
        throw new \Exception('This migration cannot be reversed. Restore from backup if needed.');
    }
};
