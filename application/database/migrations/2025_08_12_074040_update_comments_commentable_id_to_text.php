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
        Schema::table('comments', function (Blueprint $table) {
            // Drop the old bigint commentable_id column
            $table->dropColumn('commentable_id');
            
            // Rename text_commentable_id to commentable_id
            $table->renameColumn('text_commentable_id', 'commentable_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('comments', function (Blueprint $table) {
            // Rename back to text_commentable_id
            $table->renameColumn('commentable_id', 'text_commentable_id');
            
            // Add back the old bigint commentable_id column
            $table->bigInteger('commentable_id')->after('commentable_type');
        });
    }
};
