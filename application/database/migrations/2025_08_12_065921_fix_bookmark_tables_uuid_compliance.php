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
        // Fix bookmark_items table
        echo "Fixing bookmark_items table...\n";
        
        // 1. Replace user_id bigint with user_uuid (which already contains correct UUIDs)
        Schema::table('bookmark_items', function (Blueprint $table) {
            $table->dropColumn('user_id');
        });
        
        DB::statement('ALTER TABLE bookmark_items RENAME COLUMN user_uuid TO user_id');
        
        // 2. Update bookmark_collection_id to use UUIDs from bookmark_collections
        // First, add a temporary UUID column
        Schema::table('bookmark_items', function (Blueprint $table) {
            $table->uuid('bookmark_collection_uuid')->nullable()->after('bookmark_collection_id');
        });
        
        // Map existing bookmark_collection_id bigints to UUIDs
        DB::statement("
            UPDATE bookmark_items 
            SET bookmark_collection_uuid = bookmark_collections.id
            FROM bookmark_collections
            WHERE bookmark_items.bookmark_collection_id = bookmark_collections.old_id
              AND bookmark_items.bookmark_collection_id IS NOT NULL
        ");
        
        // Drop the old bigint column and rename UUID column
        Schema::table('bookmark_items', function (Blueprint $table) {
            $table->dropColumn('bookmark_collection_id');
        });
        
        DB::statement('ALTER TABLE bookmark_items RENAME COLUMN bookmark_collection_uuid TO bookmark_collection_id');
        
        // Add foreign key constraint
        DB::statement('ALTER TABLE bookmark_items ADD CONSTRAINT bookmark_items_bookmark_collection_id_foreign FOREIGN KEY (bookmark_collection_id) REFERENCES bookmark_collections(id) ON DELETE CASCADE');
        
        $itemsUpdated = DB::table('bookmark_items')->whereNotNull('bookmark_collection_id')->count();
        echo "Updated {$itemsUpdated} bookmark_items with UUID bookmark_collection_id\n";
        
        // Fix bookmark_collections_users table
        echo "Fixing bookmark_collections_users table...\n";
        
        // Since there are 0 records, we can safely update the schema
        // Add temporary UUID column for user_id
        Schema::table('bookmark_collections_users', function (Blueprint $table) {
            $table->uuid('user_uuid')->nullable()->after('user_id');
        });
        
        // If there were records, we would map them here:
        // DB::statement("
        //     UPDATE bookmark_collections_users 
        //     SET user_uuid = users.id
        //     FROM users
        //     WHERE bookmark_collections_users.user_id = users.old_id
        // ");
        
        // Drop old bigint column and rename UUID column
        Schema::table('bookmark_collections_users', function (Blueprint $table) {
            $table->dropColumn('user_id');
        });
        
        DB::statement('ALTER TABLE bookmark_collections_users RENAME COLUMN user_uuid TO user_id');
        
        // Add foreign key constraint
        DB::statement('ALTER TABLE bookmark_collections_users ADD CONSTRAINT bookmark_collections_users_user_id_foreign FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE');
        
        echo "Successfully fixed bookmark tables UUID compliance\n";
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // This migration is complex to reverse, recommend backup restoration if needed
        throw new Exception('This migration cannot be easily reversed. Please restore from backup if needed.');
    }
};
