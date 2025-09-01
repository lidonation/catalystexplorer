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
        // First, check if there are any invalid UUIDs in the model_id column
        $invalidIds = DB::table('bookmark_collections')
            ->whereNotNull('model_id')
            ->whereRaw('NOT (model_id ~ \'[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\') OR LENGTH(model_id) != 36')
            ->count();

        if ($invalidIds > 0) {
            throw new Exception("Found {$invalidIds} invalid UUID(s) in bookmark_collections.model_id column. Please fix these records before running the migration.");
        }

        // Change the column type from text to uuid
        Schema::table('bookmark_collections', function (Blueprint $table) {
            // Use raw SQL to change the column type
            DB::statement('ALTER TABLE bookmark_collections ALTER COLUMN model_id TYPE uuid USING model_id::uuid');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Reverse the change back to text
        Schema::table('bookmark_collections', function (Blueprint $table) {
            DB::statement('ALTER TABLE bookmark_collections ALTER COLUMN model_id TYPE text');
        });
    }
};
