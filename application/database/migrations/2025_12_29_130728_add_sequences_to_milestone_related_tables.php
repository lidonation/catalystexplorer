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
        $tables = [
            'milestone_som_reviews',
            'milestone_poas',
            'milestone_poas_reviews',
            'milestone_poas_signoffs',
        ];

        foreach ($tables as $table) {
            // Create sequence
            DB::statement("CREATE SEQUENCE IF NOT EXISTS {$table}_id_seq");
            
            // Set the sequence to start after the max existing id (minimum 1 for PostgreSQL)
            $maxId = DB::table($table)->max('id') ?? 0;
            $sequenceValue = max(1, $maxId);
            DB::statement("SELECT setval('{$table}_id_seq', {$sequenceValue})");
            
            // Set the column default to use the sequence
            DB::statement("ALTER TABLE {$table} ALTER COLUMN id SET DEFAULT nextval('{$table}_id_seq')");
            
            // Associate the sequence with the column
            DB::statement("ALTER SEQUENCE {$table}_id_seq OWNED BY {$table}.id");
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
            // Remove the default
            DB::statement("ALTER TABLE {$table} ALTER COLUMN id DROP DEFAULT");
            
            // Drop the sequence
            DB::statement("DROP SEQUENCE IF EXISTS {$table}_id_seq");
        }
    }
};
