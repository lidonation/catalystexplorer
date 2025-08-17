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
        DB::statement('ALTER TABLE bookmark_items ADD COLUMN old_id BIGINT');

        // Copy current IDs to old_id column
        DB::statement('UPDATE bookmark_items SET old_id = id');

        // Add new UUID column
        DB::statement('ALTER TABLE bookmark_items ADD COLUMN new_id UUID DEFAULT gen_random_uuid()');

        // Populate new_id with UUIDs for all existing records
        DB::statement('UPDATE bookmark_items SET new_id = gen_random_uuid() WHERE new_id IS NULL');

        // Drop old primary key constraint
        DB::statement('ALTER TABLE bookmark_items DROP CONSTRAINT bookmark_items_pkey');

        // Drop the old id column
        DB::statement('ALTER TABLE bookmark_items DROP COLUMN id');

        // Rename new_id to id
        DB::statement('ALTER TABLE bookmark_items RENAME COLUMN new_id TO id');

        // Add primary key constraint on new UUID id
        DB::statement('ALTER TABLE bookmark_items ADD PRIMARY KEY (id)');

        // Make id column NOT NULL
        DB::statement('ALTER TABLE bookmark_items ALTER COLUMN id SET NOT NULL');

        Schema::enableForeignKeyConstraints();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {

    }
};
