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
        // First drop all dependent foreign key constraints
        Schema::table('reactions', function (Blueprint $table) {
            $table->dropForeign(['comment_id']);
        });
        
        Schema::table('comments', function (Blueprint $table) {
            $table->dropForeign(['parent_id']);
        });
        
        Schema::table('comments', function (Blueprint $table) {
            // Drop the primary key constraint
            $table->dropPrimary(['id']);
            
            // Drop the old bigint id and parent_id columns
            $table->dropColumn(['id', 'parent_id']);
        });
        
        Schema::table('comments', function (Blueprint $table) {
            // Rename uuid_id to id and make it primary
            $table->renameColumn('uuid_id', 'id');
            
            // Rename uuid_parent_id to parent_id
            $table->renameColumn('uuid_parent_id', 'parent_id');
        });
        
        Schema::table('comments', function (Blueprint $table) {
            // Add primary key constraint to the new UUID id
            $table->primary('id');
            
            // Add self-referential foreign key for parent_id
            $table->foreign('parent_id')
                  ->references('id')
                  ->on('comments')
                  ->cascadeOnDelete();
        });
        
        // Update reactions table to use UUID for comment_id
        Schema::table('reactions', function (Blueprint $table) {
            // Since there's no data, we can drop and recreate the column as UUID
            $table->dropColumn('comment_id');
            $table->uuid('comment_id')->after('commentator_id');
        });
        
        // Re-add the foreign key constraint with UUID
        Schema::table('reactions', function (Blueprint $table) {
            $table->foreign('comment_id')
                  ->references('id')
                  ->on('comments')
                  ->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('comments', function (Blueprint $table) {
            // Drop constraints
            $table->dropPrimary(['id']);
            $table->dropForeign(['parent_id']);
            
            // Rename back to uuid columns
            $table->renameColumn('id', 'uuid_id');
            $table->renameColumn('parent_id', 'uuid_parent_id');
        });
        
        Schema::table('comments', function (Blueprint $table) {
            // Add back the old bigint columns
            $table->bigIncrements('id')->first();
            $table->bigInteger('parent_id')->nullable()->after('commentable_id');
        });
    }
};
