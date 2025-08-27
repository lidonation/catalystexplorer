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

        // Add old_id column to store original bigint IDs for reference
        DB::statement('ALTER TABLE bookmark_items ADD COLUMN old_model_id TEXT');

        // Copy current IDs to old_id column
        DB::statement('UPDATE bookmark_items SET old_model_id = model_id');

        // Add new UUID column
        DB::statement('ALTER TABLE bookmark_items ADD COLUMN new_model_id UUID DEFAULT gen_random_uuid()');

        // Populate new_id with UUIDs for all existing records
        DB::statement('UPDATE bookmark_items SET new_model_id = gen_random_uuid() WHERE new_model_id  IS NULL');

        // Drop old primary key constraint
        // DB::statement('ALTER TABLE bookmark_items DROP CONSTRAINT proposal_profiles_pkey');

        // Drop the old id column
        DB::statement('ALTER TABLE bookmark_items DROP COLUMN model_id ');

        // Rename new_id to model_id 
        DB::statement('ALTER TABLE bookmark_items RENAME COLUMN new_model_id TO model_id ');

        // Add primary key constraint on new UUID model_id 
        // DB::statement('ALTER TABLE bookmark_items ADD PRIMARY KEY (model_id )');

        // Make id column NOT NULL
        DB::statement('ALTER TABLE bookmark_items ALTER COLUMN model_id  SET NOT NULL');

        Schema::enableForeignKeyConstraints();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void {}
};
