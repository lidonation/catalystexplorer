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
        Schema::disableForeignKeyConstraints();

        // Check if old_id column already exists
        $oldIdExists = Schema::hasColumn('metas', 'old_id');
        
        // Check if id column is already UUID type
        $hasUuidId = DB::select("SELECT data_type FROM information_schema.columns WHERE table_name = 'metas' AND column_name = 'id'")[0]->data_type === 'uuid';
        
        if (!$oldIdExists && !$hasUuidId) {
            // Original scenario: bigint id, no old_id column
            
            // Add old_id column to store original bigint IDs for reference
            DB::statement('ALTER TABLE metas ADD COLUMN old_id BIGINT');

            // Copy current IDs to old_id column
            DB::statement('UPDATE metas SET old_id = id');

            // Add new UUID column
            DB::statement('ALTER TABLE metas ADD COLUMN new_id UUID DEFAULT gen_random_uuid()');

            // Populate new_id with UUIDs for all existing records
            DB::statement('UPDATE metas SET new_id = gen_random_uuid() WHERE new_id IS NULL');

            // Drop old primary key constraint
            DB::statement('ALTER TABLE metas DROP CONSTRAINT metas_pkey');

            // Drop the old id column
            DB::statement('ALTER TABLE metas DROP COLUMN id');

            // Rename new_id to id
            DB::statement('ALTER TABLE metas RENAME COLUMN new_id TO id');

            // Add primary key constraint on new UUID id
            DB::statement('ALTER TABLE metas ADD PRIMARY KEY (id)');

            // Make id column NOT NULL
            DB::statement('ALTER TABLE metas ALTER COLUMN id SET NOT NULL');
        } elseif ($oldIdExists && $hasUuidId) {
            // Migration was already partially completed
            // Just ensure the id column is NOT NULL and has proper constraints
            try {
                DB::statement('ALTER TABLE metas ALTER COLUMN id SET NOT NULL');
            } catch (Exception $e) {
                // Column might already be NOT NULL
            }
            
            // Ensure primary key exists
            $hasPrimaryKey = DB::select("SELECT COUNT(*) as count FROM information_schema.table_constraints WHERE table_name = 'metas' AND constraint_type = 'PRIMARY KEY'")[0]->count > 0;
            
            if (!$hasPrimaryKey) {
                DB::statement('ALTER TABLE metas ADD PRIMARY KEY (id)');
            }
        } else {
            // Handle other edge cases if needed
            throw new Exception('Unexpected table state. Please check the metas table structure.');
        }

        Schema::enableForeignKeyConstraints();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void {}
};
