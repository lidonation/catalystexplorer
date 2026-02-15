<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Check if the column is already UUID type
        $columnType = DB::select(
            "SELECT data_type FROM information_schema.columns 
             WHERE table_name = 'announcements' AND column_name = 'user_id'"
        )[0]->data_type ?? null;
        
        // Only proceed if the column is not already UUID
        if ($columnType !== 'uuid') {
            // First, clear any existing data to avoid conversion issues
            DB::table('announcements')->truncate();
            
            // Use Laravel schema builder for proper column type change
            Schema::table('announcements', function (Blueprint $table) {
                // Drop and recreate the column as UUID
                $table->dropColumn('user_id');
            });
            
            Schema::table('announcements', function (Blueprint $table) {
                // Recreate as UUID column
                $table->uuid('user_id')->after('deleted_at');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Clear data and revert back to bigint
        DB::table('announcements')->truncate();
        DB::statement('ALTER TABLE announcements ALTER COLUMN user_id TYPE bigint');
    }
};
