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
        // Fix orphaned campaign references in proposals table
        // Set campaign_id and campaign_uuid to NULL for proposals that reference non-existent campaigns
        DB::statement("
            UPDATE proposals 
            SET campaign_id = NULL, campaign_uuid = NULL 
            WHERE campaign_id IS NOT NULL 
            AND campaign_id NOT IN (SELECT id FROM campaigns)
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // This migration fixes data integrity issues, so we can't easily reverse it
        // The original incorrect data would need to be restored manually if needed
    }
};
