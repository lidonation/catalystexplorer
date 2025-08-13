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
        // Fix remaining pivot tables: community_has_proposal, group_has_proposal
        $pivotTables = ['community_has_proposal', 'group_has_proposal'];
        
        foreach ($pivotTables as $tableName) {
            echo "Processing {$tableName}...\n";
            
            if (!Schema::hasTable($tableName) || !Schema::hasColumn($tableName, 'proposal_id')) {
                echo "Skipping {$tableName} - not found or no proposal_id column\n";
                continue;
            }
            
            // Add temporary UUID column
            Schema::table($tableName, function (Blueprint $table) {
                $table->uuid('proposal_uuid')->nullable()->after('proposal_id');
            });
            
            // Map old proposal_id to new UUID using proposals.old_id
            DB::statement("
                UPDATE {$tableName} 
                SET proposal_uuid = (
                    SELECT id 
                    FROM proposals 
                    WHERE proposals.old_id = {$tableName}.proposal_id
                )
                WHERE proposal_id IS NOT NULL
            ");
            
            $totalRows = DB::table($tableName)->whereNotNull('proposal_id')->count();
            $mappedRows = DB::table($tableName)->whereNotNull('proposal_uuid')->count();
            
            echo "{$tableName}: {$mappedRows}/{$totalRows} rows mapped to UUID\n";
            
            // Drop old proposal_id column
            Schema::table($tableName, function (Blueprint $table) {
                $table->dropColumn('proposal_id');
            });
            
            // Rename proposal_uuid to proposal_id
            Schema::table($tableName, function (Blueprint $table) {
                $table->renameColumn('proposal_uuid', 'proposal_id');
            });
            
            // Add foreign key constraint
            Schema::table($tableName, function (Blueprint $table) {
                $table->foreign('proposal_id')->references('id')->on('proposals')->onDelete('cascade');
            });
        }
        
        echo "✅ Fixed remaining pivot tables to use UUIDs\n";
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        throw new \Exception('This migration cannot be reversed safely.');
    }
};
