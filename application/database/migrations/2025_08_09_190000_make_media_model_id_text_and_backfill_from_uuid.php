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
        if (!Schema::hasTable('media')) {
            return;
        }

        // 1) Change model_id to text so it can store either integer ids or UUIDs as strings
        // This avoids type errors when Eloquent passes a UUID string for models that switched to UUID PKs.
        DB::statement('ALTER TABLE media ALTER COLUMN model_id TYPE text USING model_id::text');

        // 2) Ensure there is an index on (model_type, model_id) for query performance
        // Drop old index if it exists (ignore if not present), then create a new one suitable for text column
        try {
            DB::statement('DROP INDEX IF EXISTS media_model_type_model_id_index');
        } catch (\Throwable $e) {
            // ignore
        }
        Schema::table('media', function (Blueprint $table) {
            $table->index(['model_type', 'model_id']);
        });

        // 3) If we previously backfilled model_uuid, copy it into model_id for rows that still have numeric model_id
        // and a non-null model_uuid. This moves consumers back to using model_id as the polymorphic key.
        if (Schema::hasColumn('media', 'model_uuid')) {
            DB::statement("
                UPDATE media
                SET model_id = model_uuid::text
                WHERE model_uuid IS NOT NULL
                  AND model_id ~ '^[0-9]+$'
            ");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Best-effort revert: change model_id back to bigint where it can be safely cast
        // Note: rows containing non-numeric values will be left as text; full reversal is not guaranteed.
        if (!Schema::hasTable('media')) {
            return;
        }

        // Drop the composite index to avoid type conflicts during change
        try {
            DB::statement('DROP INDEX IF EXISTS media_model_type_model_id_index');
        } catch (\Throwable $e) {
            // ignore
        }

        // Attempt to convert numeric-only model_id values back to bigint
        // Non-numeric values will cause the statement to fail, so guard it by updating non-numeric to NULL first
        DB::statement("UPDATE media SET model_id = NULL WHERE model_id !~ '^[0-9]+$'");
        DB::statement('ALTER TABLE media ALTER COLUMN model_id TYPE bigint USING model_id::bigint');

        // Recreate the index
        Schema::table('media', function (Blueprint $table) {
            $table->index(['model_type', 'model_id']);
        });
    }
};

