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
        // Update all records where created_at is null
        // Set created_at to updated_at value where updated_at exists
        DB::statement("
            UPDATE catalyst_tallies 
            SET created_at = COALESCE(updated_at, NOW()) 
            WHERE created_at IS NULL
        ");
        
        // Also set any remaining null updated_at to current timestamp
        DB::statement("
            UPDATE catalyst_tallies 
            SET updated_at = NOW() 
            WHERE updated_at IS NULL
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // We don't want to undo this fix, but if needed we could set created_at back to null
        // DB::statement("UPDATE catalyst_tallies SET created_at = NULL");
    }
};