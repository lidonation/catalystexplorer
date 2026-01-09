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
        // First, clear existing data since we're changing the data type (only if table exists)
        if (Schema::hasTable('model_links')) {
            DB::table('model_links')->truncate();
        }
        
        // Drop the existing foreign key constraint if it exists
        if (Schema::hasTable('model_links')) {
            try {
                Schema::table('model_links', function (Blueprint $table) {
                    $table->dropIndex(['link_id']); // Drop any existing index
                });
            } catch (\Exception $e) {
                // Index doesn't exist, continue
            }
        }
        
        // Change link_id from bigint to uuid
        if (Schema::hasTable('model_links')) {
            try {
                Schema::table('model_links', function (Blueprint $table) {
                    $table->dropColumn('link_id');
                });
            } catch (\Exception $e) {
                // Column doesn't exist, continue
            }
            
            try {
                Schema::table('model_links', function (Blueprint $table) {
                    $table->uuid('link_id')->after('id');
                    $table->index('link_id');
                });
            } catch (\Exception $e) {
                // Unable to add column, continue
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Clear data before reverting (only if table exists)
        if (Schema::hasTable('model_links')) {
            DB::table('model_links')->truncate();
        }
        
        // Revert link_id back to bigint
        if (Schema::hasTable('model_links')) {
            try {
                Schema::table('model_links', function (Blueprint $table) {
                    $table->dropIndex(['link_id']);
                    $table->dropColumn('link_id');
                });
            } catch (\Exception $e) {
                // Table/Index doesn't exist, continue
            }
        }
        
        if (Schema::hasTable('model_links')) {
            try {
                Schema::table('model_links', function (Blueprint $table) {
                    $table->bigInteger('link_id')->after('id');
                    $table->index('link_id');
                });
            } catch (\Exception $e) {
                // Unable to add column, continue
            }
        }
    }
};
