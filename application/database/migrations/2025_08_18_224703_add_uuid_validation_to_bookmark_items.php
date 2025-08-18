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
        // First clean up any remaining old integer model_id values
        DB::table('bookmark_items')
            ->whereRaw('model_id ~ \'^[0-9]+$\'')
            ->delete();

        // Add a check constraint to ensure model_id follows UUID format for UUID-based models
        DB::statement(
            "ALTER TABLE bookmark_items ADD CONSTRAINT bookmark_items_model_id_uuid_check 
             CHECK (
                 (model_type NOT LIKE 'App\\Models\\%' AND model_type NOT IN ('Proposal', 'Group', 'IdeascaleProfile', 'Community', 'Review')) 
                 OR 
                 (model_id ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$')
             )"
        );
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('ALTER TABLE bookmark_items DROP CONSTRAINT IF EXISTS bookmark_items_model_id_uuid_check');
    }
};
