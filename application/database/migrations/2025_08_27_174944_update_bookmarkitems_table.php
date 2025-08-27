<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Step 1: Make model_id nullable
        DB::statement('ALTER TABLE bookmark_items ALTER COLUMN model_id DROP NOT NULL');

        // Step 2: Restore data from old_model_id where present
        DB::statement('UPDATE bookmark_items SET model_id = old_model_id::uuid WHERE old_model_id IS NOT NULL');

        // Step 3: Drop old_model_id backup column if no longer needed
        DB::statement('ALTER TABLE bookmark_items DROP COLUMN old_model_id');
    }

    public function down(): void
    {
        // Reverse: add old_model_id back and copy current values into it
        DB::statement('ALTER TABLE bookmark_items ADD COLUMN old_model_id TEXT');
        DB::statement('UPDATE bookmark_items SET old_model_id = model_id::text');
    }
};
