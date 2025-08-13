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
        // Drop foreign key constraints and update all referencing tables
        Schema::table('community_has_proposal', function (Blueprint $table) {
            // No foreign key constraint exists for community_id in this table
            $table->dropColumn('community_id');
            $table->renameColumn('community_uuid', 'community_id');
        });
        
        Schema::table('community_has_users', function (Blueprint $table) {
            $table->dropForeign(['community_id']);
            $table->dropColumn('community_id');
            $table->renameColumn('community_uuid', 'community_id');
        });
        
        if (Schema::hasTable('community_has_groups')) {
            Schema::table('community_has_groups', function (Blueprint $table) {
                $table->dropForeign(['community_id']);
                $table->dropColumn('community_id');
                $table->renameColumn('community_uuid', 'community_id');
            });
        }
        
        if (Schema::hasTable('community_has_ideascale_profile')) {
            Schema::table('community_has_ideascale_profile', function (Blueprint $table) {
                $table->dropForeign(['community_id']);
                $table->dropColumn('community_id');
                $table->renameColumn('community_uuid', 'community_id');
            });
        }
        
        // Switch communities table to UUID primary key
        Schema::table('communities', function (Blueprint $table) {
            $table->dropColumn('user_id');
            $table->renameColumn('user_uuid', 'user_id');
        });
        
        Schema::table('communities', function (Blueprint $table) {
            $table->dropPrimary(['id']);
            $table->dropColumn('id');
            $table->renameColumn('uuid_id', 'id');
        });
        
        Schema::table('communities', function (Blueprint $table) {
            $table->primary('id');
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
        });
        
        // Re-add foreign key constraints with UUID
        Schema::table('community_has_proposal', function (Blueprint $table) {
            $table->foreign('community_id')->references('id')->on('communities')->cascadeOnDelete();
        });
        
        Schema::table('community_has_users', function (Blueprint $table) {
            $table->foreign('community_id')->references('id')->on('communities')->cascadeOnDelete();
        });
        
        if (Schema::hasTable('community_has_groups')) {
            Schema::table('community_has_groups', function (Blueprint $table) {
                $table->foreign('community_id')->references('id')->on('communities')->cascadeOnDelete();
            });
        }
        
        if (Schema::hasTable('community_has_ideascale_profile')) {
            Schema::table('community_has_ideascale_profile', function (Blueprint $table) {
                $table->foreign('community_id')->references('id')->on('communities')->cascadeOnDelete();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop foreign key constraints
        Schema::table('community_has_proposal', function (Blueprint $table) {
            $table->dropForeign(['community_id']);
        });
        
        Schema::table('community_has_users', function (Blueprint $table) {
            $table->dropForeign(['community_id']);
        });
        
        Schema::table('communities', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
        });
        
        // Reverse the communities table changes
        Schema::table('communities', function (Blueprint $table) {
            $table->dropPrimary(['id']);
            $table->renameColumn('id', 'uuid_id');
            $table->renameColumn('user_id', 'user_uuid');
        });
        
        Schema::table('communities', function (Blueprint $table) {
            $table->bigIncrements('id')->first();
            $table->bigInteger('user_id')->after('content');
        });
        
        // Reverse pivot table changes
        Schema::table('community_has_proposal', function (Blueprint $table) {
            $table->renameColumn('community_id', 'community_uuid');
            $table->bigInteger('community_id')->first();
        });
        
        Schema::table('community_has_users', function (Blueprint $table) {
            $table->renameColumn('community_id', 'community_uuid');
            $table->bigInteger('community_id')->first();
        });
    }
};
