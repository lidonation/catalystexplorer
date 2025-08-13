<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('proposal_profiles')) {
            return;
        }

        // Step 1: Map IdeascaleProfile numeric profile_id to UUIDs using ideascale_profiles.old_id
        if (Schema::hasTable('ideascale_profiles') && Schema::hasColumn('ideascale_profiles', 'old_id')) {
            $updated = DB::update(
                "UPDATE proposal_profiles 
                 SET profile_id = (SELECT ip.id FROM ideascale_profiles ip WHERE ip.old_id = proposal_profiles.profile_id::text::bigint LIMIT 1)
                 WHERE profile_type = 'App\\\\Models\\\\IdeascaleProfile'
                   AND profile_id::text ~ '^[0-9]+$'
                   AND EXISTS (SELECT 1 FROM ideascale_profiles ip WHERE ip.old_id = proposal_profiles.profile_id::text::bigint)"
            );
            
            echo "Mapped $updated proposal_profiles entries to UUIDs\n";
        }

        // Step 2: Remove any remaining numeric entries that couldn't be mapped
        $remaining = DB::delete(
            "DELETE FROM proposal_profiles 
             WHERE profile_type = 'App\\\\Models\\\\IdeascaleProfile' 
             AND profile_id::text ~ '^[0-9]+$'"
        );
        
        if ($remaining > 0) {
            echo "Removed $remaining unmappable numeric entries\n";
        }

        // Step 3: Keep profile_id as text to handle mixed types (UUIDs for IdeascaleProfile, potentially integers for other types)
        // The polymorphic queries will work with explicit casting handled by the ORM
    }

    public function down(): void
    {
        // Convert back to varchar to handle mixed types
        if (Schema::hasTable('proposal_profiles')) {
            DB::statement('ALTER TABLE proposal_profiles ALTER COLUMN profile_id TYPE varchar USING profile_id::varchar');
        }
    }
};
