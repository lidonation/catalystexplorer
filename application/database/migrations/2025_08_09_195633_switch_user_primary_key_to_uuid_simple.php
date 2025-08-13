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
        // Drop foreign key constraints that reference users.id (only for existing tables)
        $foreignKeyTables = [
            'campaigns' => 'campaigns_user_id_foreign',
            'model_has_permissions' => 'model_has_permissions_model_id_foreign',
            'model_has_roles' => 'model_has_roles_model_id_foreign',
            'oauth_access_tokens' => 'oauth_access_tokens_user_id_foreign',
            'oauth_auth_codes' => 'oauth_auth_codes_user_id_foreign',
            'oauth_refresh_tokens' => 'oauth_refresh_tokens_user_id_foreign',
            'personal_access_tokens' => 'personal_access_tokens_tokenable_id_foreign',
            'announcements' => 'announcements_user_id_foreign',
            'bookmark_collections_users' => 'bookmark_collections_users_user_id_foreign',
            'catalyst_dreps' => 'catalyst_dreps_user_id_foreign',
            'communities' => 'communities_user_id_foreign',
            'community_has_users' => 'community_has_users_user_id_foreign',
            'ideascale_profiles' => 'ideascale_profiles_claimed_by_id_foreign',
            'metrics' => 'metrics_user_id_foreign',
            'rankings' => 'rankings_user_id_foreign',
            'services' => 'services_user_id_foreign',
            'signatures' => 'signatures_user_id_foreign',
        ];
        
        foreach ($foreignKeyTables as $tableName => $constraintName) {
            if (Schema::hasTable($tableName)) {
                DB::statement("ALTER TABLE {$tableName} DROP CONSTRAINT IF EXISTS {$constraintName}");
            }
        }
        
        // Switch users table primary key from id to uuid
        Schema::table('users', function (Blueprint $table) {
            $table->dropPrimary('id');
            $table->renameColumn('id', 'old_id');
            $table->renameColumn('uuid', 'id');
            $table->primary('id');
        });
        
        // Update referencing tables to use uuid columns
        
        // campaigns table - if it still has user_id
        if (Schema::hasColumn('campaigns', 'user_id')) {
            Schema::table('campaigns', function (Blueprint $table) {
                $table->renameColumn('user_id', 'old_user_id');
                $table->renameColumn('user_uuid', 'user_id');
                $table->index('user_id');
            });
        }
        
        // model_has_permissions table
        if (Schema::hasColumn('model_has_permissions', 'model_uuid')) {
            Schema::table('model_has_permissions', function (Blueprint $table) {
                $table->renameColumn('model_id', 'old_model_id');
                $table->renameColumn('model_uuid', 'model_id');
                $table->index(['model_id', 'model_type']);
            });
        }
        
        // model_has_roles table
        if (Schema::hasColumn('model_has_roles', 'model_uuid')) {
            Schema::table('model_has_roles', function (Blueprint $table) {
                $table->renameColumn('model_id', 'old_model_id');
                $table->renameColumn('model_uuid', 'model_id');
                $table->index(['model_id', 'model_type']);
            });
        }
        
        // oauth_access_tokens table
        if (Schema::hasColumn('oauth_access_tokens', 'user_uuid')) {
            Schema::table('oauth_access_tokens', function (Blueprint $table) {
                $table->renameColumn('user_id', 'old_user_id');
                $table->renameColumn('user_uuid', 'user_id');
                $table->index('user_id');
            });
        }
        
        // oauth_auth_codes table
        if (Schema::hasColumn('oauth_auth_codes', 'user_uuid')) {
            Schema::table('oauth_auth_codes', function (Blueprint $table) {
                $table->renameColumn('user_id', 'old_user_id');
                $table->renameColumn('user_uuid', 'user_id');
                $table->index('user_id');
            });
        }
        
        // oauth_refresh_tokens table
        if (Schema::hasColumn('oauth_refresh_tokens', 'user_uuid')) {
            Schema::table('oauth_refresh_tokens', function (Blueprint $table) {
                $table->renameColumn('user_id', 'old_user_id');
                $table->renameColumn('user_uuid', 'user_id');
                $table->index('user_id');
            });
        }
        
        // personal_access_tokens table (polymorphic)
        if (Schema::hasColumn('personal_access_tokens', 'tokenable_uuid')) {
            Schema::table('personal_access_tokens', function (Blueprint $table) {
                $table->renameColumn('tokenable_id', 'old_tokenable_id');
                $table->renameColumn('tokenable_uuid', 'tokenable_id');
                $table->index(['tokenable_id', 'tokenable_type']);
            });
        }
        
        // Recreate foreign key constraints with new UUID columns
        if (Schema::hasColumn('campaigns', 'user_id')) {
            Schema::table('campaigns', function (Blueprint $table) {
                $table->foreign('user_id')->references('id')->on('users');
            });
        }
        
        if (Schema::hasColumn('oauth_access_tokens', 'user_id')) {
            Schema::table('oauth_access_tokens', function (Blueprint $table) {
                $table->foreign('user_id')->references('id')->on('users');
            });
        }
        
        if (Schema::hasColumn('oauth_auth_codes', 'user_id')) {
            Schema::table('oauth_auth_codes', function (Blueprint $table) {
                $table->foreign('user_id')->references('id')->on('users');
            });
        }
        
        if (Schema::hasColumn('oauth_refresh_tokens', 'user_id')) {
            Schema::table('oauth_refresh_tokens', function (Blueprint $table) {
                $table->foreign('user_id')->references('id')->on('users');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // This migration is not easily reversible due to the complexity
        // of switching back from UUID to integer primary keys
        throw new \Exception('This migration cannot be reversed safely');
    }
};
