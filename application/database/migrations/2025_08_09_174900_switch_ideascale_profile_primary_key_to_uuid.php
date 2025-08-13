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
        // Step 1: Drop foreign key constraints that reference ideascale_profiles.id
        $this->dropForeignKeyConstraints();

        // Step 2: Preserve old ID, drop primary key, and rename uuid to id
        Schema::table('ideascale_profiles', function (Blueprint $table) {
            $table->dropPrimary(['id']);
            // Rename the old integer id to old_id before dropping
            $table->renameColumn('id', 'old_id');
        });

        Schema::table('ideascale_profiles', function (Blueprint $table) {
            $table->renameColumn('uuid', 'id');
        });

        // Step 3: Set the new UUID column as primary key
        Schema::table('ideascale_profiles', function (Blueprint $table) {
            $table->primary('id');
        });

        // Step 4: Update referencing tables to use UUID foreign keys
        $this->updateReferencingTables();

        // Step 5: Add foreign key constraints back
        $this->addForeignKeyConstraints();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // This is a destructive migration - once UUIDs are in place, 
        // we cannot easily revert to integer IDs without data loss
        throw new Exception('This migration cannot be reversed - UUID primary keys cannot be reverted to integers without data loss');
    }

    private function dropForeignKeyConstraints(): void
    {
        $tables = [
            'group_has_ideascale_profile',
            'ideascale_profile_has_proposal', 
            'monthly_reports',
            'community_has_ideascale_profile'
        ];

        foreach ($tables as $table) {
            if (Schema::hasTable($table)) {
                Schema::table($table, function (Blueprint $table) {
                    // Try to drop foreign key constraints if they exist
                    try {
                        $table->dropForeign(['ideascale_profile_id']);
                    } catch (Exception $e) {
                        // Foreign key might not exist, continue
                    }
                });
            }
        }
    }

    private function updateReferencingTables(): void
    {
        $tables = [
            'group_has_ideascale_profile',
            'ideascale_profile_has_proposal',
            'monthly_reports',
            'community_has_ideascale_profile'
        ];

        foreach ($tables as $tableName) {
            if (Schema::hasTable($tableName)) {
                Schema::table($tableName, function (Blueprint $table) {
                    // Drop the old integer foreign key column
                    $table->dropColumn('ideascale_profile_id');
                });

                Schema::table($tableName, function (Blueprint $table) {
                    // Rename the UUID column to the standard foreign key name
                    $table->renameColumn('ideascale_profile_uuid', 'ideascale_profile_id');
                });
            }
        }
    }

    private function addForeignKeyConstraints(): void
    {
        $tables = [
            'group_has_ideascale_profile',
            'ideascale_profile_has_proposal',
            'monthly_reports',
            'community_has_ideascale_profile'
        ];

        foreach ($tables as $tableName) {
            if (Schema::hasTable($tableName)) {
                Schema::table($tableName, function (Blueprint $table) {
                    $table->foreign('ideascale_profile_id')
                          ->references('id')
                          ->on('ideascale_profiles')
                          ->onDelete('cascade');
                });
            }
        }
    }
};
