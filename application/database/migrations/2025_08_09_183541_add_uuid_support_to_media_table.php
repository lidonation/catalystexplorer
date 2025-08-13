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
        // Add UUID column for polymorphic relationships
        Schema::table('media', function (Blueprint $table) {
            $table->uuid('model_uuid')->nullable()->after('model_id');
            $table->index('model_uuid');
            $table->index(['model_type', 'model_uuid']);
        });
        
        // Backfill UUIDs for existing media records
        // Update for User model (if users still have old integer id structure)
        if (DB::select("SELECT data_type FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'id'")[0]->data_type === 'bigint') {
            DB::statement('
                UPDATE media 
                SET model_uuid = users.uuid 
                FROM users 
                WHERE media.model_type = ? AND media.model_id = users.id
            ', ['App\\Models\\User']);
        } else {
            echo "Warning: Users already use UUID primary key, skipping media backfill\n";
        }
        
        // Skip NFT and Fund model updates - these have switched to UUID primary keys 
        // without maintaining old_id mapping, so existing media records with integer 
        // model_ids cannot be mapped to new UUIDs.
        echo "Warning: Skipping NFT and Fund media records - these may be orphaned due to UUID migration\n";
        
        // Update for Campaign model (if campaigns still have old integer id structure)
        if (DB::select("SELECT data_type FROM information_schema.columns WHERE table_name = 'campaigns' AND column_name = 'id'")[0]->data_type === 'bigint') {
            DB::statement('
                UPDATE media 
                SET model_uuid = campaigns.uuid 
                FROM campaigns 
                WHERE media.model_type = ? AND media.model_id = campaigns.id
            ', ['App\\Models\\Campaign']);
        } else {
            echo "Warning: Campaigns already use UUID primary key, skipping media backfill\n";
        }
        
        // Update for IdeascaleProfile model (if they still have old integer id structure)
        if (DB::select("SELECT data_type FROM information_schema.columns WHERE table_name = 'ideascale_profiles' AND column_name = 'id'")[0]->data_type === 'bigint') {
            DB::statement('
                UPDATE media 
                SET model_uuid = ideascale_profiles.uuid 
                FROM ideascale_profiles 
                WHERE media.model_type = ? AND media.model_id = ideascale_profiles.id
            ', ['App\\Models\\IdeascaleProfile']);
        } else {
            echo "Warning: IdeascaleProfiles already use UUID primary key, skipping media backfill\n";
        }
        
        // Update for Group model (if groups still have old integer id structure)
        if (DB::select("SELECT data_type FROM information_schema.columns WHERE table_name = 'groups' AND column_name = 'id'")[0]->data_type === 'bigint') {
            DB::statement('
                UPDATE media 
                SET model_uuid = "groups".uuid 
                FROM "groups" 
                WHERE media.model_type = ? AND media.model_id = "groups".id
            ', ['App\\Models\\Group']);
        } else {
            echo "Warning: Groups already use UUID primary key, skipping media backfill\n";
        }
        
        // Update for other models that might have media but don't use UUIDs yet
        // These will keep using the integer model_id until they're migrated
        // Community, Service, Announcement, Taxonomy models still use integer IDs
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('media', function (Blueprint $table) {
            $table->dropIndex(['model_type', 'model_uuid']);
            $table->dropIndex(['model_uuid']);
            $table->dropColumn('model_uuid');
        });
    }
};
