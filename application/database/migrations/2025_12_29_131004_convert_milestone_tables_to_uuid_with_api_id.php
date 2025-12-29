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
        $tables = [
            'milestone_som_reviews',
            'milestone_poas',
            'milestone_poas_reviews',
            'milestone_poas_signoffs',
        ];

        foreach ($tables as $table) {
            // Step 1: Add api_id column to store the original bigint IDs
            Schema::table($table, function (Blueprint $table) {
                $table->bigInteger('api_id')->nullable()->after('id');
            });

            // Step 2: Copy existing id values to api_id
            DB::statement("UPDATE {$table} SET api_id = id");

            // Step 3: Drop the sequence default from id column
            DB::statement("ALTER TABLE {$table} ALTER COLUMN id DROP DEFAULT");

            // Step 4: Change id column to UUID type
            // First, we need to generate UUIDs for existing rows
            DB::statement("ALTER TABLE {$table} ALTER COLUMN id TYPE uuid USING gen_random_uuid()");

            // Step 5: Drop the sequence (no longer needed)
            DB::statement("DROP SEQUENCE IF EXISTS {$table}_id_seq");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $tables = [
            'milestone_som_reviews',
            'milestone_poas',
            'milestone_poas_reviews',
            'milestone_poas_signoffs',
        ];

        foreach ($tables as $table) {
            // Recreate sequence
            DB::statement("CREATE SEQUENCE IF NOT EXISTS {$table}_id_seq");

            // Restore id from api_id and convert back to bigint
            DB::statement("ALTER TABLE {$table} ALTER COLUMN id TYPE bigint USING api_id");

            // Set the sequence default
            $maxId = DB::table($table)->max('api_id') ?? 0;
            DB::statement("SELECT setval('{$table}_id_seq', {$maxId})");
            DB::statement("ALTER TABLE {$table} ALTER COLUMN id SET DEFAULT nextval('{$table}_id_seq')");
            DB::statement("ALTER SEQUENCE {$table}_id_seq OWNED BY {$table}.id");

            // Drop api_id column
            Schema::table($table, function (Blueprint $table) {
                $table->dropColumn('api_id');
            });
        }
    }
};
