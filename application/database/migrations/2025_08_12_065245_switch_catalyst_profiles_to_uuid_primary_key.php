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
        // Step 1: Drop foreign key constraints that depend on the primary key
        DB::statement('ALTER TABLE catalyst_profile_has_proposal DROP CONSTRAINT IF EXISTS catalyst_profile_has_proposal_catalyst_profile_id_foreign');
        
        // Step 2: Update catalyst_profile_has_proposal to use UUIDs
        // First add a temporary UUID column
        Schema::table('catalyst_profile_has_proposal', function (Blueprint $table) {
            $table->uuid('catalyst_profile_uuid')->nullable()->after('catalyst_profile_id');
        });
        
        // Map the existing bigint IDs to UUIDs
        DB::statement("
            UPDATE catalyst_profile_has_proposal 
            SET catalyst_profile_uuid = catalyst_profiles.uuid
            FROM catalyst_profiles
            WHERE catalyst_profile_has_proposal.catalyst_profile_id = catalyst_profiles.old_id
        ");
        
        // Drop the old bigint column and rename UUID column
        Schema::table('catalyst_profile_has_proposal', function (Blueprint $table) {
            $table->dropColumn('catalyst_profile_id');
        });
        
        DB::statement('ALTER TABLE catalyst_profile_has_proposal RENAME COLUMN catalyst_profile_uuid TO catalyst_profile_id');
        
        // Step 3: Now we can safely drop the primary key constraint on catalyst_profiles
        DB::statement('ALTER TABLE catalyst_profiles DROP CONSTRAINT catalyst_profiles_pkey');
        
        // Step 4: Drop the old id column and rename uuid to id
        Schema::table('catalyst_profiles', function (Blueprint $table) {
            $table->dropColumn('id');
        });
        
        DB::statement('ALTER TABLE catalyst_profiles RENAME COLUMN uuid TO id');
        DB::statement('ALTER TABLE catalyst_profiles ADD PRIMARY KEY (id)');
        
        // Step 5: Re-add foreign key constraint with UUID
        DB::statement('ALTER TABLE catalyst_profile_has_proposal ADD CONSTRAINT catalyst_profile_has_proposal_catalyst_profile_id_foreign FOREIGN KEY (catalyst_profile_id) REFERENCES catalyst_profiles(id)');
        
        echo "Successfully switched catalyst_profiles primary key to UUID and updated references\n";
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // This migration is not easily reversible due to the complexity
        // of recreating bigint auto-increment primary keys
        throw new Exception('This migration cannot be reversed. Please restore from backup if needed.');
    }
};
