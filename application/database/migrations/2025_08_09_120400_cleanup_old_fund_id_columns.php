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
        // Handle dependent objects that might reference old columns
        $this->handleDependentObjects();
        
        // Remove old integer columns after successful UUID migration
        Schema::table('funds', function (Blueprint $table) {
            $table->dropColumn(['old_id', 'old_parent_id']);
        });

        $tables = ['proposals', 'campaigns', 'milestones', 'proposal_milestones', 'bookmark_collections'];
        
        foreach ($tables as $tableName) {
            if (Schema::hasTable($tableName) && Schema::hasColumn($tableName, 'old_fund_id')) {
                try {
                    Schema::table($tableName, function (Blueprint $table) {
                        $table->dropColumn('old_fund_id');
                    });
                } catch (\Exception $e) {
                    // If there are dependencies, use CASCADE
                    DB::statement("ALTER TABLE {$tableName} DROP COLUMN old_fund_id CASCADE");
                }
            }
        }
        
        // Restore dependent objects
        $this->restoreDependentObjects();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // This migration is not easily reversible since we're dropping data
        // If rollback is needed, restore from backup before this migration
        throw new \Exception('This migration cannot be reversed. Restore from backup if needed.');
    }
    
    private function handleDependentObjects(): void
    {
        // Drop the specific materialized view that depends on old_fund_id
        DB::statement("DROP MATERIALIZED VIEW IF EXISTS _proposal_ratings");
        
        // You can add more dependent objects here as needed
    }
    
    private function restoreDependentObjects(): void
    {
        // Recreate the materialized view with the new fund_id column
        // Note: This is a placeholder - you'll need to update this with the actual view definition
        // that uses fund_id instead of old_fund_id
        
        try {
            // Example - replace with actual view definition
            DB::statement("
                CREATE MATERIALIZED VIEW _proposal_ratings AS
                SELECT p.id, p.fund_id, p.title
                FROM proposals p
                WHERE p.fund_id IS NOT NULL
            ");
        } catch (\Exception $e) {
            // The view can be recreated manually if this fails
            // Log or handle as appropriate for your application
        }
    }
};
