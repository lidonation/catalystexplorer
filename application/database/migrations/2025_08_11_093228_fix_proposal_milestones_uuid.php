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
        // Fix proposal_milestones.proposal_id to UUID
        
        // Add temporary UUID column
        Schema::table('proposal_milestones', function (Blueprint $table) {
            $table->uuid('proposal_uuid')->nullable()->after('proposal_id');
        });
        
        // Map old proposal_id to new UUID using proposals.old_id
        DB::statement('
            UPDATE proposal_milestones 
            SET proposal_uuid = (
                SELECT id 
                FROM proposals 
                WHERE proposals.old_id = proposal_milestones.proposal_id
            )
            WHERE proposal_id IS NOT NULL
        ');
        
        $totalRows = DB::table('proposal_milestones')->whereNotNull('proposal_id')->count();
        $mappedRows = DB::table('proposal_milestones')->whereNotNull('proposal_uuid')->count();
        
        echo "proposal_milestones: {$mappedRows}/{$totalRows} rows mapped to UUID\n";
        
        // Drop old proposal_id column
        Schema::table('proposal_milestones', function (Blueprint $table) {
            $table->dropColumn('proposal_id');
        });
        
        // Rename proposal_uuid to proposal_id
        Schema::table('proposal_milestones', function (Blueprint $table) {
            $table->renameColumn('proposal_uuid', 'proposal_id');
        });
        
        echo "✅ Fixed proposal_milestones.proposal_id to use UUIDs\n";
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        throw new \Exception('This migration cannot be reversed safely.');
    }
};
