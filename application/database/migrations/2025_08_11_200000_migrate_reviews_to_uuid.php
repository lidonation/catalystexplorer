<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Step 1: Add UUID columns and old_id backup columns
        Schema::table('reviews', function (Blueprint $table) {
            $table->uuid('uuid')->nullable()->after('id');
            $table->bigInteger('old_id')->nullable()->after('uuid');
            $table->text('old_parent_id')->nullable()->after('parent_id');
        });
        
        Schema::table('moderations', function (Blueprint $table) {
            $table->uuid('new_review_id')->nullable()->after('review_id');
        });
        
        Schema::table('ratings', function (Blueprint $table) {
            $table->uuid('new_review_id')->nullable()->after('review_id');
        });

        // Step 2: Generate UUIDs for all reviews and backup old IDs
        DB::statement('UPDATE reviews SET uuid = gen_random_uuid(), old_id = id');
        
        // Step 3: Update foreign key references in related tables
        
        // Update moderations.new_review_id
        DB::statement('
            UPDATE moderations 
            SET new_review_id = reviews.uuid 
            FROM reviews 
            WHERE reviews.old_id = moderations.review_id
        ');
        
        // Update ratings.new_review_id 
        DB::statement('
            UPDATE ratings 
            SET new_review_id = reviews.uuid 
            FROM reviews 
            WHERE reviews.old_id = ratings.review_id
        ');
        
        // Update parent_id references within reviews table
        DB::statement('
            UPDATE reviews 
            SET old_parent_id = parent_reviews.uuid::text
            FROM reviews AS parent_reviews 
            WHERE parent_reviews.old_id = reviews.parent_id
        ');

        // Step 4: Drop old primary key and foreign key constraints
        Schema::table('moderations', function (Blueprint $table) {
            $table->dropColumn('review_id');
        });
        
        Schema::table('ratings', function (Blueprint $table) {
            $table->dropColumn('review_id');
        });
        
        Schema::table('reviews', function (Blueprint $table) {
            $table->dropColumn('parent_id');
        });

        // Step 5: Drop old primary key and rename columns
        Schema::table('reviews', function (Blueprint $table) {
            $table->dropPrimary();
            $table->dropColumn('id');
        });

        // Step 6: Rename new columns to final names
        Schema::table('reviews', function (Blueprint $table) {
            $table->renameColumn('uuid', 'id');
            $table->renameColumn('old_parent_id', 'parent_id');
        });
        
        Schema::table('moderations', function (Blueprint $table) {
            $table->renameColumn('new_review_id', 'review_id');
        });
        
        Schema::table('ratings', function (Blueprint $table) {
            $table->renameColumn('new_review_id', 'review_id');
        });

        // Step 7: Add new primary key and make columns non-nullable
        Schema::table('reviews', function (Blueprint $table) {
            $table->primary('id');
        });
        
        // Step 8: Make foreign key columns non-nullable where appropriate
        // Keep moderations.review_id nullable since some moderations may not have reviews
        Schema::table('moderations', function (Blueprint $table) {
            $table->uuid('review_id')->nullable()->change();
        });
        
        // ratings.review_id should remain nullable as it was before
        Schema::table('ratings', function (Blueprint $table) {
            $table->uuid('review_id')->nullable()->change();
        });

        // Step 9: Add foreign key constraints
        Schema::table('moderations', function (Blueprint $table) {
            $table->foreign('review_id')->references('id')->on('reviews');
        });
        
        Schema::table('ratings', function (Blueprint $table) {
            $table->foreign('review_id')->references('id')->on('reviews');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // This is a destructive migration that cannot be easily reversed
        // because we lose the original bigint IDs
        throw new Exception('This migration cannot be reversed safely.');
    }
};
