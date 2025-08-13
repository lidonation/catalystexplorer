<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // model_has_roles
        if (Schema::hasTable('model_has_roles')) {
            // Drop existing composite index if present to avoid type conflicts
            try { DB::statement('DROP INDEX IF EXISTS model_has_roles_model_id_model_type_index'); } catch (\Throwable $e) {}
            try { DB::statement('DROP INDEX IF EXISTS model_has_roles_model_type_model_id_index'); } catch (\Throwable $e) {}

            // Change column type to text to support UUIDs and integers
            DB::statement('ALTER TABLE model_has_roles ALTER COLUMN model_id TYPE text USING model_id::text');

            // If a model_uuid column exists from prior migrations, copy it into model_id where appropriate
            if (Schema::hasColumn('model_has_roles', 'model_uuid')) {
                DB::statement("UPDATE model_has_roles SET model_id = model_uuid::text WHERE model_uuid IS NOT NULL AND model_id ~ '^[0-9]+$'");
            }

            // Recreate index for performance
            Schema::table('model_has_roles', function (Blueprint $table) {
                $table->index(['model_type', 'model_id']);
            });
        }

        // model_has_permissions
        if (Schema::hasTable('model_has_permissions')) {
            try { DB::statement('DROP INDEX IF EXISTS model_has_permissions_model_id_model_type_index'); } catch (\Throwable $e) {}
            try { DB::statement('DROP INDEX IF EXISTS model_has_permissions_model_type_model_id_index'); } catch (\Throwable $e) {}

            DB::statement('ALTER TABLE model_has_permissions ALTER COLUMN model_id TYPE text USING model_id::text');

            if (Schema::hasColumn('model_has_permissions', 'model_uuid')) {
                DB::statement("UPDATE model_has_permissions SET model_id = model_uuid::text WHERE model_uuid IS NOT NULL AND model_id ~ '^[0-9]+$'");
            }

            Schema::table('model_has_permissions', function (Blueprint $table) {
                $table->index(['model_type', 'model_id']);
            });
        }
    }

    public function down(): void
    {
        // Best-effort: convert numeric-only model_id back to bigint and restore index
        if (Schema::hasTable('model_has_roles')) {
            try { DB::statement('DROP INDEX IF EXISTS model_has_roles_model_type_model_id_index'); } catch (\Throwable $e) {}
            DB::statement("UPDATE model_has_roles SET model_id = NULL WHERE model_id !~ '^[0-9]+$'");
            DB::statement('ALTER TABLE model_has_roles ALTER COLUMN model_id TYPE bigint USING model_id::bigint');
            Schema::table('model_has_roles', function (Blueprint $table) {
                $table->index(['model_type', 'model_id']);
            });
        }

        if (Schema::hasTable('model_has_permissions')) {
            try { DB::statement('DROP INDEX IF EXISTS model_has_permissions_model_type_model_id_index'); } catch (\Throwable $e) {}
            DB::statement("UPDATE model_has_permissions SET model_id = NULL WHERE model_id !~ '^[0-9]+$'");
            DB::statement('ALTER TABLE model_has_permissions ALTER COLUMN model_id TYPE bigint USING model_id::bigint');
            Schema::table('model_has_permissions', function (Blueprint $table) {
                $table->index(['model_type', 'model_id']);
            });
        }
    }
};

