<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Add a unique constraint to the proposal_profiles table to prevent
     * duplicate attachments of the same profile to the same proposal.
     * This runs after the duplicate removal migration.
     */
    public function up(): void
    {
        Schema::table('proposal_profiles', function (Blueprint $table) {
            // Add unique constraint on the combination of proposal_id, profile_type, and profile_id
            // This prevents the same profile from being attached to the same proposal multiple times
            $table->unique(
                ['proposal_id', 'profile_type', 'profile_id'], 
                'proposal_profiles_unique_attachment'
            );
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('proposal_profiles', function (Blueprint $table) {
            // Remove the unique constraint
            $table->dropUnique('proposal_profiles_unique_attachment');
        });
    }
};
