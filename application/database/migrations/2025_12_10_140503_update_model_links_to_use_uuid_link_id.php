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
        // First, clear existing data since we're changing the data type
        DB::table('model_links')->truncate();
        
        // Drop the existing foreign key constraint if it exists
        Schema::table('model_links', function (Blueprint $table) {
            $table->dropIndex(['link_id']); // Drop any existing index
        });
        
        // Change link_id from bigint to uuid
        Schema::table('model_links', function (Blueprint $table) {
            $table->dropColumn('link_id');
        });
        
        Schema::table('model_links', function (Blueprint $table) {
            $table->uuid('link_id')->after('id');
            $table->index('link_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Clear data before reverting
        DB::table('model_links')->truncate();
        
        // Revert link_id back to bigint
        Schema::table('model_links', function (Blueprint $table) {
            $table->dropIndex(['link_id']);
            $table->dropColumn('link_id');
        });
        
        Schema::table('model_links', function (Blueprint $table) {
            $table->bigInteger('link_id')->after('id');
            $table->index('link_id');
        });
    }
};
