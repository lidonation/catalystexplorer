<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // Admin UUID provided by operator for role assignment after cleanup
    private string $adminUuid = '985835fc-91ab-4c45-9195-a4adfde7295a';

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

        // Only operate in UUID environment
        if ($usersIdType !== 'uuid') {
            return;
        }

        // Clean approach: remove all numeric model_id entries for User model
        // (These represent legacy assignments that can't be reliably mapped due to UUID migration)
        if (Schema::hasTable('model_has_roles')) {
            DB::delete(
                "DELETE FROM model_has_roles WHERE model_type = 'App\\\\Models\\\\User' AND model_id ~ '^[0-9]+$'"
            );
        }

        if (Schema::hasTable('model_has_permissions')) {
            DB::delete(
                "DELETE FROM model_has_permissions WHERE model_type = 'App\\\\Models\\\\User' AND model_id ~ '^[0-9]+$'"
            );
        }

        // Assign super admin role to the provided admin UUID to ensure access
        if (Schema::hasTable('model_has_roles') && Schema::hasTable('roles')) {
            // Find super admin role (ID 8) or fallback to admin role
            $superAdminRole = DB::selectOne("SELECT id FROM roles WHERE name = 'super admin' OR id = 8 LIMIT 1");
            if ($superAdminRole) {
                DB::statement(
                    "INSERT INTO model_has_roles (role_id, model_id, model_type) VALUES (?, ?, ?) ON CONFLICT DO NOTHING",
                    [$superAdminRole->id, $this->adminUuid, 'App\\\\Models\\\\User']
                );
            }
        }
    }

    public function down(): void
    {
        // Irreversible: cannot restore deleted role assignments
    }
};
