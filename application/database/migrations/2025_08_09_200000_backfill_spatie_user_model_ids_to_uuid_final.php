<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Only proceed if users table exists
        if (!Schema::hasTable('users')) {
            return;
        }

        // Detect users.id data type and whether users.old_id exists
        $usersIdType = null;
        try {
            $row = DB::selectOne("SELECT data_type FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'id'");
            $usersIdType = $row ? strtolower($row->data_type) : null;
        } catch (\Throwable $e) {
            $usersIdType = null;
        }
        $hasOldId = Schema::hasColumn('users', 'old_id');

        // Backfill only when users.id is UUID and users.old_id is present for mapping
        if ($usersIdType === 'uuid' && $hasOldId) {
            if (Schema::hasTable('model_has_roles')) {
                DB::statement(
                    "UPDATE model_has_roles mhr
                     SET model_id = u.id::text
                     FROM users u
                     WHERE mhr.model_type = 'App\\\\Models\\\\User'
                       AND mhr.model_id ~ '^[0-9]+$'
                       AND u.old_id IS NOT NULL
                       AND mhr.model_id::bigint = u.old_id"
                );
            }

            if (Schema::hasTable('model_has_permissions')) {
                DB::statement(
                    "UPDATE model_has_permissions mhp
                     SET model_id = u.id::text
                     FROM users u
                     WHERE mhp.model_type = 'App\\\\Models\\\\User'
                       AND mhp.model_id ~ '^[0-9]+$'
                       AND u.old_id IS NOT NULL
                       AND mhp.model_id::bigint = u.old_id"
                );
            }
        }
        // If conditions are not met, we skip to avoid breaking installs where users are still bigint
    }

    public function down(): void
    {
        // Irreversible data migration
    }
};

