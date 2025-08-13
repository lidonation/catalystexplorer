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
        echo "Switching tinder_collections primary key to UUID...\n";
        
        // Step 1: Drop the primary key constraint
        DB::statement('ALTER TABLE tinder_collections DROP CONSTRAINT tinder_collections_pkey');
        
        // Step 2: Drop the old id column
        Schema::table('tinder_collections', function (Blueprint $table) {
            $table->dropColumn('id');
        });
        
        // Step 3: Rename uuid column to id and make it primary key
        DB::statement('ALTER TABLE tinder_collections RENAME COLUMN uuid TO id');
        DB::statement('ALTER TABLE tinder_collections ADD PRIMARY KEY (id)');
        
        echo "Successfully switched tinder_collections primary key to UUID\n";
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // This migration is not easily reversible
        throw new Exception('This migration cannot be reversed. Please restore from backup if needed.');
    }
};
