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
        // Add a new UUID column for the owner relationship
        Schema::table('groups', function (Blueprint $table) {
            $table->uuid('owner_id')->nullable()->after('user_id');
        });

        // Migrate existing user_id values to owner_id using ideascale_profiles mapping
        DB::statement("
            UPDATE groups 
            SET owner_id = ideascale_profiles.id 
            FROM ideascale_profiles 
            WHERE groups.user_id = ideascale_profiles.old_id
            AND groups.user_id IS NOT NULL
        ");

        // Remove the old user_id column
        Schema::table('groups', function (Blueprint $table) {
            $table->dropColumn('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Add back the user_id column
        Schema::table('groups', function (Blueprint $table) {
            $table->bigInteger('user_id')->nullable()->after('owner_id');
        });

        // Restore user_id values from owner_id using ideascale_profiles mapping
        DB::statement("
            UPDATE groups 
            SET user_id = ideascale_profiles.old_id 
            FROM ideascale_profiles 
            WHERE groups.owner_id = ideascale_profiles.id
            AND groups.owner_id IS NOT NULL
        ");

        // Remove the owner_id column
        Schema::table('groups', function (Blueprint $table) {
            $table->dropColumn('owner_id');
        });
    }
};
