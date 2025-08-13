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
        // This is a simple approach - just drop and recreate foreign keys
        // Drop all foreign key constraints first
        DB::statement('ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS campaigns_fund_id_foreign');
        DB::statement('ALTER TABLE proposals DROP CONSTRAINT IF EXISTS proposals_campaign_id_foreign');
        
        // Drop primary key and rename uuid to id
        DB::statement('ALTER TABLE campaigns DROP CONSTRAINT campaigns_pkey');
        DB::statement('ALTER TABLE campaigns DROP COLUMN id');
        DB::statement('ALTER TABLE campaigns RENAME COLUMN uuid TO id');
        
        // Add primary key constraint
        DB::statement('ALTER TABLE campaigns ADD PRIMARY KEY (id)');
        
        // Update referencing tables
        DB::statement('ALTER TABLE proposals DROP COLUMN campaign_id');
        DB::statement('ALTER TABLE proposals RENAME COLUMN campaign_uuid TO campaign_id');
        
        // Recreate foreign key constraints
        DB::statement('ALTER TABLE campaigns ADD CONSTRAINT campaigns_fund_id_foreign FOREIGN KEY (fund_id) REFERENCES funds(id) ON DELETE CASCADE');
        DB::statement('ALTER TABLE proposals ADD CONSTRAINT proposals_campaign_id_foreign FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // This is a destructive migration - cannot be reversed
        throw new Exception('This migration cannot be reversed - UUID primary keys cannot be reverted to integers without data loss');
    }
};
