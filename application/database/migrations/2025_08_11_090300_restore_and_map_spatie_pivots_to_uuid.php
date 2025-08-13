<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('users')) {
            return;
        }

        // Detect users.id data type
        $usersIdType = null;
        try {
            $row = DB::selectOne("SELECT data_type FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'id'");
            $usersIdType = $row ? strtolower($row->data_type) : null;
        } catch (\Throwable $e) {
            $usersIdType = null;
        }

        // Only operate in UUID environment with old_id mapping available
        if ($usersIdType !== 'uuid' || !Schema::hasColumn('users', 'old_id')) {
            return;
        }

        // Step 1: For model_has_roles, create a temp table to rebuild mappings
        if (Schema::hasTable('model_has_roles') && Schema::hasTable('roles')) {
            // Create temporary table for role mappings we want to preserve
            DB::statement('CREATE TEMP TABLE temp_role_mappings AS 
                SELECT DISTINCT r.id as role_id, u.id as user_uuid, mhr.model_type
                FROM model_has_roles mhr 
                JOIN users u ON u.old_id IS NOT NULL AND mhr.model_id::bigint = u.old_id
                JOIN roles r ON r.id = mhr.role_id
                WHERE mhr.model_type = \'App\\Models\\User\' 
                AND mhr.model_id ~ \'^[0-9]+$\'
            ');

            // Delete existing numeric entries
            DB::delete("DELETE FROM model_has_roles WHERE model_type = 'App\\\\Models\\\\User' AND model_id ~ '^[0-9]+$'");

            // Insert the mapped entries back, handling conflicts
            DB::statement('INSERT INTO model_has_roles (role_id, model_id, model_type)
                SELECT role_id, user_uuid, model_type 
                FROM temp_role_mappings
                ON CONFLICT (role_id, model_id, model_type) DO NOTHING
            ');

            // Clean up temp table
            DB::statement('DROP TABLE temp_role_mappings');
        }

        // Step 2: Same for model_has_permissions
        if (Schema::hasTable('model_has_permissions') && Schema::hasTable('permissions')) {
            DB::statement('CREATE TEMP TABLE temp_permission_mappings AS 
                SELECT DISTINCT p.id as permission_id, u.id as user_uuid, mhp.model_type
                FROM model_has_permissions mhp 
                JOIN users u ON u.old_id IS NOT NULL AND mhp.model_id::bigint = u.old_id
                JOIN permissions p ON p.id = mhp.permission_id
                WHERE mhp.model_type = \'App\\Models\\User\' 
                AND mhp.model_id ~ \'^[0-9]+$\'
            ');

            DB::delete("DELETE FROM model_has_permissions WHERE model_type = 'App\\\\Models\\\\User' AND model_id ~ '^[0-9]+$'");

            DB::statement('INSERT INTO model_has_permissions (permission_id, model_id, model_type)
                SELECT permission_id, user_uuid, model_type 
                FROM temp_permission_mappings
                ON CONFLICT (permission_id, model_id, model_type) DO NOTHING
            ');

            DB::statement('DROP TABLE temp_permission_mappings');
        }
    }

    public function down(): void
    {
        // This migration cannot be safely reversed since it involves data transformation
    }
};
