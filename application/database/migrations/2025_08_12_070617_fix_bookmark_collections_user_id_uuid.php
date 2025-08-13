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
        echo "Fixing bookmark_collections user_id to UUID...\n";
        
        // Drop the old bigint user_id column
        Schema::table('bookmark_collections', function (Blueprint $table) {
            $table->dropColumn('user_id');
        });
        
        // Rename user_uuid to user_id
        DB::statement('ALTER TABLE bookmark_collections RENAME COLUMN user_uuid TO user_id');
        
        // Add foreign key constraint
        DB::statement('ALTER TABLE bookmark_collections ADD CONSTRAINT bookmark_collections_user_id_foreign FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE');
        
        echo "Successfully fixed bookmark_collections user_id to UUID\n";
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // This migration is not easily reversible
        throw new Exception('This migration cannot be easily reversed. Please restore from backup if needed.');
    }
};
