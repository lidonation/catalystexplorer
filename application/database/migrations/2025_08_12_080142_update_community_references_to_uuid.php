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
        // Update community_has_proposal table
        Schema::table('community_has_proposal', function (Blueprint $table) {
            $table->uuid('community_uuid')->nullable()->after('community_id');
        });

        // Convert community_id to UUIDs in community_has_proposal
        $proposalUpdates = DB::select("
            SELECT chp.community_id, c.uuid_id as community_uuid
            FROM community_has_proposal chp
            JOIN communities c ON c.id = chp.community_id
        ");
        
        foreach ($proposalUpdates as $update) {
            DB::table('community_has_proposal')
                ->where('community_id', $update->community_id)
                ->update(['community_uuid' => $update->community_uuid]);
        }

        // Update community_has_users table
        Schema::table('community_has_users', function (Blueprint $table) {
            $table->uuid('community_uuid')->nullable()->after('community_id');
        });
        
        // Convert community_id to UUIDs in community_has_users (if any data exists)
        $userUpdates = DB::select("
            SELECT chu.community_id, c.uuid_id as community_uuid
            FROM community_has_users chu
            JOIN communities c ON c.id = chu.community_id
        ");
        
        foreach ($userUpdates as $update) {
            DB::table('community_has_users')
                ->where('community_id', $update->community_id)
                ->update(['community_uuid' => $update->community_uuid]);
        }

        // Update community_has_groups table
        if (Schema::hasTable('community_has_groups')) {
            Schema::table('community_has_groups', function (Blueprint $table) {
                $table->uuid('community_uuid')->nullable()->after('community_id');
            });
            
            $groupUpdates = DB::select("
                SELECT chg.community_id, c.uuid_id as community_uuid
                FROM community_has_groups chg
                JOIN communities c ON c.id = chg.community_id
            ");
            
            foreach ($groupUpdates as $update) {
                DB::table('community_has_groups')
                    ->where('community_id', $update->community_id)
                    ->update(['community_uuid' => $update->community_uuid]);
            }
        }

        // Update community_has_ideascale_profile table
        if (Schema::hasTable('community_has_ideascale_profile')) {
            Schema::table('community_has_ideascale_profile', function (Blueprint $table) {
                $table->uuid('community_uuid')->nullable()->after('community_id');
            });
            
            $ideascaleUpdates = DB::select("
                SELECT chip.community_id, c.uuid_id as community_uuid
                FROM community_has_ideascale_profile chip
                JOIN communities c ON c.id = chip.community_id
            ");
            
            foreach ($ideascaleUpdates as $update) {
                DB::table('community_has_ideascale_profile')
                    ->where('community_id', $update->community_id)
                    ->update(['community_uuid' => $update->community_uuid]);
            }
        }

        // Update bookmark_items table for Community polymorphic references
        $bookmarkUpdates = DB::select("
            SELECT bi.id, c.uuid_id as community_uuid
            FROM bookmark_items bi
            JOIN communities c ON c.id = CAST(bi.model_id AS INTEGER)
            WHERE bi.model_type = 'App\\Models\\Community'
        ");
        
        foreach ($bookmarkUpdates as $update) {
            DB::table('bookmark_items')
                ->where('id', $update->id)
                ->update(['model_id' => $update->community_uuid]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Restore original community_id values in community_has_proposal
        $proposalRestores = DB::select("
            SELECT chp.community_uuid, c.old_id
            FROM community_has_proposal chp
            JOIN communities c ON c.uuid_id = chp.community_uuid
            WHERE chp.community_uuid IS NOT NULL
        ");
        
        foreach ($proposalRestores as $restore) {
            DB::table('community_has_proposal')
                ->where('community_uuid', $restore->community_uuid)
                ->update(['community_id' => $restore->old_id]);
        }

        // Restore original community_id values in community_has_users
        $userRestores = DB::select("
            SELECT chu.community_uuid, c.old_id
            FROM community_has_users chu
            JOIN communities c ON c.uuid_id = chu.community_uuid
            WHERE chu.community_uuid IS NOT NULL
        ");
        
        foreach ($userRestores as $restore) {
            DB::table('community_has_users')
                ->where('community_uuid', $restore->community_uuid)
                ->update(['community_id' => $restore->old_id]);
        }
        
        // Restore bookmark_items references
        $bookmarkRestores = DB::select("
            SELECT bi.id, c.old_id
            FROM bookmark_items bi
            JOIN communities c ON c.uuid_id = bi.model_id
            WHERE bi.model_type = 'App\\Models\\Community'
        ");
        
        foreach ($bookmarkRestores as $restore) {
            DB::table('bookmark_items')
                ->where('id', $restore->id)
                ->update(['model_id' => $restore->old_id]);
        }

        // Drop UUID columns
        Schema::table('community_has_proposal', function (Blueprint $table) {
            $table->dropColumn('community_uuid');
        });
        
        Schema::table('community_has_users', function (Blueprint $table) {
            $table->dropColumn('community_uuid');
        });
    }
};
