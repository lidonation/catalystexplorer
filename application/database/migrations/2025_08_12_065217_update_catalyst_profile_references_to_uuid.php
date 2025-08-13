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
        // Update proposal_profiles.profile_id from bigint to UUID for CatalystProfile entries
        $updated = 0;
        
        // Use a single SQL statement to update all CatalystProfile references
        $affected = DB::statement("
            UPDATE proposal_profiles 
            SET profile_id = catalyst_profiles.uuid::text
            FROM catalyst_profiles
            WHERE proposal_profiles.profile_type = 'App\\Models\\CatalystProfile'
              AND proposal_profiles.profile_id::integer = catalyst_profiles.old_id
        ");
        
        // Count how many were updated for logging
        $count = DB::table('proposal_profiles')
            ->where('profile_type', 'App\\Models\\CatalystProfile')
            ->whereRaw("profile_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'")
            ->count();
            
        echo "Updated {$count} CatalystProfile references in proposal_profiles to UUID\n";
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Reverse the UUID mapping back to bigint IDs
        DB::statement("
            UPDATE proposal_profiles 
            SET profile_id = catalyst_profiles.old_id::text
            FROM catalyst_profiles
            WHERE proposal_profiles.profile_type = 'App\\Models\\CatalystProfile'
              AND proposal_profiles.profile_id = catalyst_profiles.uuid::text
        ");
        
        echo "Reverted CatalystProfile references back to numeric IDs\n";
    }
};
