<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * This migrates existing claimed profile relationships into the new polymorphic table.
     */
    public function up(): void
    {
        // Skip migration in test environment to avoid missing table errors
        if (app()->environment('testing')) {
            return;
        }

        // Check if tables exist before attempting migration
        $schema = DB::getSchemaBuilder();
        
        // Migrate existing CatalystProfile claimed relationships
        if ($schema->hasTable('catalyst_profiles')) {
            DB::statement("
                INSERT INTO claimed_profiles (user_id, claimable_id, claimable_type, claimed_at, created_at, updated_at)
                SELECT
                    claimed_by as user_id,
                    id as claimable_id,
                    'App\\Models\\CatalystProfile' as claimable_type,
                    COALESCE(updated_at, created_at) as claimed_at,
                    NOW() as created_at,
                    NOW() as updated_at
                FROM catalyst_profiles
                WHERE claimed_by IS NOT NULL
                ON CONFLICT (user_id, claimable_id, claimable_type) DO NOTHING
            ");
        }

        // Migrate existing IdeascaleProfile claimed relationships
        if ($schema->hasTable('ideascale_profiles')) {
            DB::statement("
                INSERT INTO claimed_profiles (user_id, claimable_id, claimable_type, claimed_at, created_at, updated_at)
                SELECT
                    claimed_by_uuid as user_id,
                    id as claimable_id,
                    'App\\Models\\IdeascaleProfile' as claimable_type,
                    COALESCE(updated_at, created_at) as claimed_at,
                    NOW() as created_at,
                    NOW() as updated_at
                FROM ideascale_profiles
                WHERE claimed_by_uuid IS NOT NULL
                ON CONFLICT (user_id, claimable_id, claimable_type) DO NOTHING
            ");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Clear the claimed_profiles table
        DB::table('claimed_profiles')->truncate();
    }
};
