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
        // Since there's no data, we can safely drop and recreate the columns with proper types
        Schema::table('comment_notification_subscriptions', function (Blueprint $table) {
            // Drop the old bigint columns
            $table->dropColumn(['commentable_id', 'subscriber_id']);
        });
        
        Schema::table('comment_notification_subscriptions', function (Blueprint $table) {
            // Add new columns with proper types
            // commentable_id as text for polymorphic relationships (like comments table)
            $table->text('commentable_id')->after('commentable_type');
            
            // subscriber_id as UUID for users table references
            $table->uuid('subscriber_id')->after('subscriber_type');
        });
        
        // Add foreign key constraint for subscriber_id to users table
        Schema::table('comment_notification_subscriptions', function (Blueprint $table) {
            $table->foreign('subscriber_id')
                  ->references('id')
                  ->on('users')
                  ->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('comment_notification_subscriptions', function (Blueprint $table) {
            // Drop foreign key constraint
            $table->dropForeign(['subscriber_id']);
            
            // Drop the new columns
            $table->dropColumn(['commentable_id', 'subscriber_id']);
        });
        
        Schema::table('comment_notification_subscriptions', function (Blueprint $table) {
            // Add back the old bigint columns
            $table->bigInteger('commentable_id')->after('commentable_type');
            $table->bigInteger('subscriber_id')->after('subscriber_type');
        });
    }
};
