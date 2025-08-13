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
        // Add UUID column to community_has_ideascale_profile if it doesn't exist
        if (Schema::hasTable('community_has_ideascale_profile') && 
            Schema::hasColumn('community_has_ideascale_profile', 'ideascale_profile_id') &&
            !Schema::hasColumn('community_has_ideascale_profile', 'ideascale_profile_uuid')) {
            
            Schema::table('community_has_ideascale_profile', function (Blueprint $table) {
                $table->uuid('ideascale_profile_uuid')->nullable()->after('ideascale_profile_id');
            });

            // Backfill the UUID column
            DB::statement("
                UPDATE community_has_ideascale_profile 
                SET ideascale_profile_uuid = ideascale_profiles.uuid 
                FROM ideascale_profiles 
                WHERE community_has_ideascale_profile.ideascale_profile_id = ideascale_profiles.id 
                AND community_has_ideascale_profile.ideascale_profile_id IS NOT NULL
            ");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('community_has_ideascale_profile') && 
            Schema::hasColumn('community_has_ideascale_profile', 'ideascale_profile_uuid')) {
            
            Schema::table('community_has_ideascale_profile', function (Blueprint $table) {
                $table->dropColumn('ideascale_profile_uuid');
            });
        }
    }
};
