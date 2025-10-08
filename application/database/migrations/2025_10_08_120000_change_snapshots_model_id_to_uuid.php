<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $invalidCount = DB::table('snapshots')
            ->whereNotNull('model_id')
            ->whereRaw("model_id !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'")
            ->count();

        if ($invalidCount > 0) {
            throw new \RuntimeException(
                sprintf('Cannot convert snapshots.model_id to UUID: %d non-UUID values detected.', $invalidCount)
            );
        }

        DB::statement('DROP INDEX IF EXISTS snapshots_model_type_model_id_index');
        DB::statement('ALTER TABLE snapshots ALTER COLUMN model_id TYPE uuid USING model_id::uuid');
        DB::statement('CREATE INDEX snapshots_model_type_model_id_index ON snapshots (model_type, model_id)');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('DROP INDEX IF EXISTS snapshots_model_type_model_id_index');
        DB::statement('ALTER TABLE snapshots ALTER COLUMN model_id TYPE text USING model_id::text');
        DB::statement('CREATE INDEX snapshots_model_type_model_id_index ON snapshots (model_type, model_id)');
    }
};
