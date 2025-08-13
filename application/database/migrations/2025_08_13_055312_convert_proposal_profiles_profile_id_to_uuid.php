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
        // Step 1: Update numeric profile_id values to UUIDs by mapping through ideascale_profiles.old_id
        echo "Converting numeric profile_id values to UUIDs...\n";
        
        // Count records that need conversion
        $numericCount = DB::table('proposal_profiles')
            ->whereRaw('profile_id ~ \'^\\d+$\'')
            ->count();
        
        echo "Found {$numericCount} numeric profile_id values to convert.\n";
        
        if ($numericCount > 0) {
            // Update numeric profile_id values to their corresponding UUIDs
            $updated = DB::statement("
                UPDATE proposal_profiles 
                SET profile_id = ideascale_profiles.id::text
                FROM ideascale_profiles 
                WHERE proposal_profiles.profile_id ~ '^\\d+$'
                  AND proposal_profiles.profile_id::bigint = ideascale_profiles.old_id
                  AND proposal_profiles.profile_type = 'App\\Models\\IdeascaleProfile'
            ");
            
            echo "Updated numeric profile_id values to UUIDs.\n";
            
            // Check if there are any remaining numeric values that couldn't be mapped
            $remainingNumeric = DB::table('proposal_profiles')
                ->whereRaw('profile_id ~ \'^\\d+$\'')
                ->count();
            
            if ($remainingNumeric > 0) {
                // Get some examples of unmappable records
                $examples = DB::table('proposal_profiles')
                    ->whereRaw('profile_id ~ \'^\\d+$\'')
                    ->select('profile_type', 'profile_id')
                    ->take(5)
                    ->get();
                
                echo "Warning: {$remainingNumeric} numeric profile_id values could not be mapped to UUIDs:\n";
                foreach ($examples as $example) {
                    echo "  Type: {$example->profile_type}, ID: {$example->profile_id}\n";
                }
                
                // For now, delete these unmappable records as they reference non-existent profiles
                DB::table('proposal_profiles')
                    ->whereRaw('profile_id ~ \'^\\d+$\'')
                    ->delete();
                
                echo "Deleted {$remainingNumeric} unmappable records.\n";
            }
        }
        
        // Step 2: Verify all profile_id values are now valid UUIDs
        $invalidUuids = DB::table('proposal_profiles')
            ->whereRaw('profile_id !~ \'[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}\'')
            ->count();
        
        if ($invalidUuids > 0) {
            throw new \Exception("Found {$invalidUuids} invalid UUID values in proposal_profiles.profile_id after conversion. Manual cleanup required.");
        }
        
        echo "All profile_id values are now valid UUIDs.\n";

        // Step 3: Drop the existing index that includes profile_id
        Schema::table('proposal_profiles', function (Blueprint $table) {
            $table->dropIndex('proposal_profiles_profile_type_profile_id_index');
        });

        // Step 4: Convert the profile_id column from varchar to uuid
        DB::statement('ALTER TABLE proposal_profiles ALTER COLUMN profile_id TYPE uuid USING profile_id::uuid');
        
        echo "Converted profile_id column type from varchar to uuid.\n";

        // Step 5: Recreate the index
        Schema::table('proposal_profiles', function (Blueprint $table) {
            $table->index(['profile_type', 'profile_id'], 'proposal_profiles_profile_type_profile_id_index');
        });
        
        echo "Migration completed successfully.\n";
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop the index
        Schema::table('proposal_profiles', function (Blueprint $table) {
            $table->dropIndex('proposal_profiles_profile_type_profile_id_index');
        });

        // Convert the profile_id column from uuid back to varchar
        DB::statement('ALTER TABLE proposal_profiles ALTER COLUMN profile_id TYPE varchar(255) USING profile_id::text');

        // Recreate the index
        Schema::table('proposal_profiles', function (Blueprint $table) {
            $table->index(['profile_type', 'profile_id'], 'proposal_profiles_profile_type_profile_id_index');
        });
    }
};
