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
        echo "Updating catalyst_dreps user_id to UUID...\n";
        
        // Add temporary UUID column
        Schema::table('catalyst_dreps', function (Blueprint $table) {
            $table->uuid('user_uuid')->nullable()->after('user_id');
        });
        
        // Map existing user_id bigints to UUIDs
        DB::statement("
            UPDATE catalyst_dreps 
            SET user_uuid = users.id
            FROM users
            WHERE catalyst_dreps.user_id = users.old_id
        ");
        
        // Drop old bigint column and rename UUID column
        Schema::table('catalyst_dreps', function (Blueprint $table) {
            $table->dropColumn('user_id');
        });
        
        DB::statement('ALTER TABLE catalyst_dreps RENAME COLUMN user_uuid TO user_id');
        
        // Add foreign key constraint
        DB::statement('ALTER TABLE catalyst_dreps ADD CONSTRAINT catalyst_dreps_user_id_foreign FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE');
        
        $userUpdated = DB::table('catalyst_dreps')->whereNotNull('user_id')->count();
        echo "Updated {$userUpdated} catalyst_dreps user_id references to UUID\n";
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
