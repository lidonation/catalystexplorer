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
        // Step 1: Add new UUID columns
        Schema::table('voters', function (Blueprint $table) {
            $table->uuid('uuid')->nullable()->after('id');
            $table->bigInteger('old_id')->nullable()->after('uuid');
            
            // Add index on new UUID column for performance
            $table->index('uuid');
        });

        // Step 2: Generate UUIDs for existing records and backup old IDs
        DB::statement('UPDATE voters SET uuid = gen_random_uuid(), old_id = id');

        // Step 3: Make UUID columns non-nullable
        Schema::table('voters', function (Blueprint $table) {
            $table->uuid('uuid')->nullable(false)->change();
        });

        // Step 4: Drop old primary key and create new UUID primary key
        Schema::table('voters', function (Blueprint $table) {
            $table->dropPrimary('voters_pkey');
        });

        Schema::table('voters', function (Blueprint $table) {
            $table->primary('uuid');
        });

        // Step 5: Drop old id column
        Schema::table('voters', function (Blueprint $table) {
            $table->dropColumn('id');
        });

        // Step 6: Rename UUID column to id
        Schema::table('voters', function (Blueprint $table) {
            $table->renameColumn('uuid', 'id');
        });

        // Step 7: Update indexes for renamed column
        DB::statement('DROP INDEX IF EXISTS voters_uuid_index');
        DB::statement('CREATE INDEX voters_id_index ON voters (id)');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Step 1: Add back old id column
        Schema::table('voters', function (Blueprint $table) {
            $table->bigIncrements('new_id')->first();
        });

        // Step 2: Restore old ID values
        DB::statement('UPDATE voters SET new_id = old_id');

        // Step 3: Drop UUID primary key
        Schema::table('voters', function (Blueprint $table) {
            $table->dropPrimary(['id']);
        });

        // Step 4: Drop UUID column and old_id
        Schema::table('voters', function (Blueprint $table) {
            $table->dropColumn(['id', 'old_id']);
        });

        // Step 5: Rename column back to original name
        Schema::table('voters', function (Blueprint $table) {
            $table->renameColumn('new_id', 'id');
        });

        // Step 6: Restore original primary key
        Schema::table('voters', function (Blueprint $table) {
            $table->primary('id');
        });
    }
};
