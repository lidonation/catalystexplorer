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
        // Handle bookmark_collections table
        $this->convertTable('bookmark_collections');

        // Handle tables with no foreign keys
        $this->convertTable('discussions');
        $this->convertTable('announcements');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        throw new Exception("Reversal not implemented for safety. Restore from backup if needed.");
    }

    private function convertTable(string $tableName): void
    {
        echo "Converting {$tableName} to UUID...\n";

        // Drop foreign key constraints if they exist
        if ($tableName === 'bookmark_collections') {
            Schema::table('bookmark_collections_users', function (Blueprint $table) {
                $table->dropForeign(['bookmark_collection_id']);
            });
        }

        // Add old_id column to store the original bigint ID
        Schema::table($tableName, function (Blueprint $table) {
            $table->unsignedBigInteger('old_id')->nullable()->after('id');
        });

        // Copy current IDs to old_id
        DB::statement("UPDATE {$tableName} SET old_id = id");

        // Add new UUID column as nullable first
        Schema::table($tableName, function (Blueprint $table) {
            $table->uuid('new_id')->nullable()->after('id');
        });

        // Generate UUIDs for existing records
        DB::statement("UPDATE {$tableName} SET new_id = gen_random_uuid()");

        // Make the new_id column NOT NULL
        Schema::table($tableName, function (Blueprint $table) {
            $table->uuid('new_id')->nullable(false)->change();
        });

        // Drop the old primary key constraint
        Schema::table($tableName, function (Blueprint $table) {
            $table->dropPrimary();
        });

        // Drop old id column and rename new_id to id
        Schema::table($tableName, function (Blueprint $table) {
            $table->dropColumn('id');
        });

        Schema::table($tableName, function (Blueprint $table) {
            $table->renameColumn('new_id', 'id');
        });

        // Set the new UUID column as primary key
        Schema::table($tableName, function (Blueprint $table) {
            $table->primary('id');
        });

        // Update related tables
        if ($tableName === 'bookmark_collections') {
            // Add temporary column to store UUID values
            Schema::table('bookmark_collections_users', function (Blueprint $table) {
                $table->uuid('temp_collection_id')->nullable();
            });

            // Update the temp column with the mapped UUIDs
            $updateSql = "UPDATE bookmark_collections_users u SET temp_collection_id = (SELECT id FROM bookmark_collections c WHERE c.old_id = u.bookmark_collection_id)";
            DB::statement($updateSql);

            // Drop the old column and rename the temp column
            Schema::table('bookmark_collections_users', function (Blueprint $table) {
                $table->dropColumn('bookmark_collection_id');
            });

            Schema::table('bookmark_collections_users', function (Blueprint $table) {
                $table->renameColumn('temp_collection_id', 'bookmark_collection_id');
            });

            // Recreate foreign key
            Schema::table('bookmark_collections_users', function (Blueprint $table) {
                $table->foreign('bookmark_collection_id')->references('id')->on('bookmark_collections')->onDelete('cascade');
            });
        }

        echo "Converted {$tableName} to UUID\n";
    }
};
