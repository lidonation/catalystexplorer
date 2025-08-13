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
        // Fix ideascale_profile_has_proposal.proposal_id to UUID
        
        // Add temporary UUID column
        Schema::table('ideascale_profile_has_proposal', function (Blueprint $table) {
            $table->uuid('proposal_uuid')->nullable()->after('proposal_id');
        });
        
        // Map old proposal_id to new UUID using proposals.old_id
        DB::statement('
            UPDATE ideascale_profile_has_proposal 
            SET proposal_uuid = (
                SELECT id 
                FROM proposals 
                WHERE proposals.old_id = ideascale_profile_has_proposal.proposal_id
            )
            WHERE proposal_id IS NOT NULL
        ');
        
        $totalRows = DB::table('ideascale_profile_has_proposal')->whereNotNull('proposal_id')->count();
        $mappedRows = DB::table('ideascale_profile_has_proposal')->whereNotNull('proposal_uuid')->count();
        
        echo "ideascale_profile_has_proposal: {$mappedRows}/{$totalRows} rows mapped to UUID\n";
        
        // Drop old proposal_id column
        Schema::table('ideascale_profile_has_proposal', function (Blueprint $table) {
            $table->dropColumn('proposal_id');
        });
        
        // Rename proposal_uuid to proposal_id
        Schema::table('ideascale_profile_has_proposal', function (Blueprint $table) {
            $table->renameColumn('proposal_uuid', 'proposal_id');
        });
        
        // Add foreign key constraint
        Schema::table('ideascale_profile_has_proposal', function (Blueprint $table) {
            $table->foreign('proposal_id')->references('id')->on('proposals')->onDelete('cascade');
        });
        
        echo "✅ Fixed ideascale_profile_has_proposal.proposal_id to use UUIDs\n";
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        throw new \Exception('This migration cannot be reversed safely.');
    }
};
