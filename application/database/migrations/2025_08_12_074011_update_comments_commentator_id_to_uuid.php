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
            // Drop the old bigint commentator_id column
            $table->dropColumn('commentator_id');
            
            // Rename uuid_commentator_id to commentator_id
            $table->renameColumn('uuid_commentator_id', 'commentator_id');
        });
        
        // Add foreign key constraint to users table
        Schema::table('comments', function (Blueprint $table) {
            $table->foreign('commentator_id')
                  ->references('id')
                  ->on('users')
                  ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('comments', function (Blueprint $table) {
            // Drop foreign key constraint
            $table->dropForeign(['commentator_id']);
            
            // Rename back to uuid_commentator_id
            $table->renameColumn('commentator_id', 'uuid_commentator_id');
            
            // Add back the old bigint commentator_id column
            $table->bigInteger('commentator_id')->nullable()->after('commentator_type');
        });
    }
};
