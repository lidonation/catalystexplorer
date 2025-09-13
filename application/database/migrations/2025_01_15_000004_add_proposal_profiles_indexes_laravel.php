<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Use Laravel Schema builder - most reliable approach
        if (Schema::hasTable('proposal_profiles')) {
            Schema::table('proposal_profiles', function (Blueprint $table) {
                // Create indexes using Laravel's Schema builder
                // Laravel will handle checking if they already exist
                try {
                    $table->index(['profile_type', 'profile_id'], 'idx_proposal_profiles_type_id');
                } catch (\Exception $e) {
                    // Index might already exist, ignore
                }
                
                try {
                    $table->index('proposal_id', 'idx_proposal_profiles_proposal_id');
                } catch (\Exception $e) {
                    // Index might already exist, ignore
                }
            });
        }

        // Add index to proposals table
        if (Schema::hasTable('proposals')) {
            Schema::table('proposals', function (Blueprint $table) {
                try {
                    $table->index('type', 'idx_proposals_type');
                } catch (\Exception $e) {
                    // Index might already exist, ignore
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('proposal_profiles')) {
            Schema::table('proposal_profiles', function (Blueprint $table) {
                try {
                    $table->dropIndex('idx_proposal_profiles_type_id');
                } catch (\Exception $e) {
                    // Index might not exist, ignore
                }
                
                try {
                    $table->dropIndex('idx_proposal_profiles_proposal_id');
                } catch (\Exception $e) {
                    // Index might not exist, ignore
                }
            });
        }

        if (Schema::hasTable('proposals')) {
            Schema::table('proposals', function (Blueprint $table) {
                try {
                    $table->dropIndex('idx_proposals_type');
                } catch (\Exception $e) {
                    // Index might not exist, ignore
                }
            });
        }
    }
};