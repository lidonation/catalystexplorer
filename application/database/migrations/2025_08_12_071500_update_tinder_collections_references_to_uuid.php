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
        echo "Updating TinderCollection references to UUID...\n";
        
        // 1. Update tinder_collections.user_id from bigint to UUID
        // Add temporary UUID column
        Schema::table('tinder_collections', function (Blueprint $table) {
            $table->uuid('user_uuid')->nullable()->after('user_id');
        });
        
        // Map existing user_id bigints to UUIDs
        DB::statement("
            UPDATE tinder_collections 
            SET user_uuid = users.id
            FROM users
            WHERE tinder_collections.user_id = users.old_id
        ");
        
        // Drop old bigint column and rename UUID column
        Schema::table('tinder_collections', function (Blueprint $table) {
            $table->dropColumn('user_id');
        });
        
        DB::statement('ALTER TABLE tinder_collections RENAME COLUMN user_uuid TO user_id');
        
        // Add foreign key constraint
        DB::statement('ALTER TABLE tinder_collections ADD CONSTRAINT tinder_collections_user_id_foreign FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE');
        
        $userUpdated = DB::table('tinder_collections')->whereNotNull('user_id')->count();
        echo "Updated {$userUpdated} tinder_collections user_id references to UUID\n";
        
        // 2. Update bookmark_collections.model_id references to use TinderCollection UUIDs
        DB::statement("
            UPDATE bookmark_collections 
            SET model_id = tinder_collections.uuid::text
            FROM tinder_collections
            WHERE bookmark_collections.model_type = 'App\\Models\\TinderCollection'
              AND bookmark_collections.model_id::integer = tinder_collections.old_id
        ");
        
        $modelUpdated = DB::table('bookmark_collections')
            ->where('model_type', 'App\\Models\\TinderCollection')
            ->count();
            
        echo "Updated {$modelUpdated} bookmark_collections model_id references to TinderCollection UUIDs\n";
        
        echo "Successfully updated TinderCollection references to UUID\n";
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // This migration is complex to reverse
        throw new Exception('This migration cannot be easily reversed. Please restore from backup if needed.');
    }
};
