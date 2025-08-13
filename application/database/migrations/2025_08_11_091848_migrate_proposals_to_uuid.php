<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Step 1: Add UUID column to proposals
        Schema::table('proposals', function (Blueprint $table) {
            $table->uuid('uuid')->nullable()->after('id');
            $table->bigInteger('old_id')->nullable()->after('uuid');
        });
        
        // Step 2: Generate UUIDs for all existing proposals
        $proposals = DB::table('proposals')
            ->select('id')
            ->orderBy('id')
            ->get();
            
        foreach ($proposals as $proposal) {
            DB::table('proposals')
                ->where('id', $proposal->id)
                ->update([
                    'uuid' => Str::uuid()->toString(),
                    'old_id' => $proposal->id
                ]);
        }
        
        // Step 3: Add UUID columns to referencing tables
        Schema::table('catalyst_profile_has_proposal', function (Blueprint $table) {
            $table->uuid('proposal_uuid')->nullable()->after('proposal_id');
        });
        
        Schema::table('proposal_profiles', function (Blueprint $table) {
            $table->uuid('proposal_uuid')->nullable()->after('proposal_id');
        });
        
        // Step 4: Populate UUID foreign keys using the mapping
        DB::statement('
            UPDATE catalyst_profile_has_proposal 
            SET proposal_uuid = (
                SELECT uuid 
                FROM proposals 
                WHERE proposals.old_id = catalyst_profile_has_proposal.proposal_id
            )
        ');
        
        DB::statement('
            UPDATE proposal_profiles 
            SET proposal_uuid = (
                SELECT uuid 
                FROM proposals 
                WHERE proposals.old_id = proposal_profiles.proposal_id
            )
        ');
        
        // Step 5: Drop foreign key constraints
        Schema::table('catalyst_profile_has_proposal', function (Blueprint $table) {
            $table->dropForeign(['proposal_id']);
        });
        
        Schema::table('proposal_profiles', function (Blueprint $table) {
            $table->dropForeign(['proposal_id']);
        });
        
        // Step 6: Make UUID columns non-nullable and add unique constraint
        Schema::table('proposals', function (Blueprint $table) {
            $table->uuid('uuid')->nullable(false)->change();
            $table->unique('uuid');
        });
        
        Schema::table('catalyst_profile_has_proposal', function (Blueprint $table) {
            $table->uuid('proposal_uuid')->nullable(false)->change();
        });
        
        Schema::table('proposal_profiles', function (Blueprint $table) {
            $table->uuid('proposal_uuid')->nullable(false)->change();
        });
        
        // Step 7: Drop materialized view that depends on proposals.id
        DB::statement('DROP MATERIALIZED VIEW IF EXISTS _proposal_ratings');
        
        // Step 8: Drop old primary key and create new UUID primary key
        Schema::table('proposals', function (Blueprint $table) {
            $table->dropPrimary('proposals_pkey');
        });
        
        Schema::table('proposals', function (Blueprint $table) {
            $table->primary('uuid');
        });
        
        // Step 9: Drop old id column and rename uuid to id
        Schema::table('proposals', function (Blueprint $table) {
            $table->dropColumn('id');
        });
        
        Schema::table('proposals', function (Blueprint $table) {
            $table->renameColumn('uuid', 'id');
        });
        
        // Step 9: Drop old foreign key columns and rename UUID columns
        Schema::table('catalyst_profile_has_proposal', function (Blueprint $table) {
            $table->dropColumn('proposal_id');
        });
        
        Schema::table('catalyst_profile_has_proposal', function (Blueprint $table) {
            $table->renameColumn('proposal_uuid', 'proposal_id');
        });
        
        Schema::table('proposal_profiles', function (Blueprint $table) {
            $table->dropColumn('proposal_id');
        });
        
        Schema::table('proposal_profiles', function (Blueprint $table) {
            $table->renameColumn('proposal_uuid', 'proposal_id');
        });
        
        // Step 10: Re-add foreign key constraints
        Schema::table('catalyst_profile_has_proposal', function (Blueprint $table) {
            $table->foreign('proposal_id')->references('id')->on('proposals')->onDelete('cascade');
        });
        
        Schema::table('proposal_profiles', function (Blueprint $table) {
            $table->foreign('proposal_id')->references('id')->on('proposals')->onDelete('cascade');
        });
        
        // Step 11: Recreate materialized view
        DB::statement('
            CREATE MATERIALIZED VIEW _proposal_ratings AS
            SELECT id, fund_id, title
            FROM proposals p
            WHERE fund_id IS NOT NULL
        ');
        
        echo "✅ Migrated " . $proposals->count() . " proposals to UUID\n";
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // This is a complex migration - reversal would be very risky
        // Better to restore from backup if needed
        throw new \Exception('This migration cannot be reversed safely. Please restore from backup.');
    }
};
