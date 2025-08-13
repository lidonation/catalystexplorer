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
        // Since there's no data and no foreign key on group_id, we can safely drop and recreate the column
        Schema::table('community_has_groups', function (Blueprint $table) {
            $table->dropColumn('group_id');
            $table->uuid('group_id')->after('community_id');
        });
        
        // Add foreign key constraint to groups table
        Schema::table('community_has_groups', function (Blueprint $table) {
            $table->foreign('group_id')
                  ->references('id')
                  ->on('groups')
                  ->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('community_has_groups', function (Blueprint $table) {
            // Drop foreign key constraint
            $table->dropForeign(['group_id']);
            
            // Drop UUID column and add back bigint
            $table->dropColumn('group_id');
            $table->bigInteger('group_id')->after('community_id');
        });
    }
};
