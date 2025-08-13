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
        // Fix action_events table to support UUID values in polymorphic columns
        
        echo "Updating action_events table for UUID compatibility...\n";
        
        // Check current column types
        $columns = DB::select(
            "SELECT column_name, data_type 
             FROM information_schema.columns 
             WHERE table_name = 'action_events' 
             AND column_name IN ('user_id', 'actionable_id', 'target_id')"
        );
        
        foreach ($columns as $column) {
            echo "Current {$column->column_name}: {$column->data_type}\n";
        }
        
        // Since the table is empty, we can safely change column types using raw SQL
        // PostgreSQL needs explicit casting instructions for these changes
        
        // Change user_id from bigint to UUID
        DB::statement('ALTER TABLE action_events ALTER COLUMN user_id TYPE uuid USING user_id::text::uuid');
        
        // Change polymorphic ID columns from bigint to text
        DB::statement('ALTER TABLE action_events ALTER COLUMN actionable_id TYPE text USING actionable_id::text');
        DB::statement('ALTER TABLE action_events ALTER COLUMN target_id TYPE text USING target_id::text');
        
        echo "✅ Updated action_events columns to support UUID values:\n";
        echo "   - user_id: bigint → uuid\n";
        echo "   - actionable_id: bigint → text\n";
        echo "   - target_id: bigint → text\n";
        echo "   - model_id: already text (from previous migration)\n";
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('action_events', function (Blueprint $table) {
            $table->bigInteger('user_id')->change();
            $table->bigInteger('actionable_id')->change();
            $table->bigInteger('target_id')->change();
        });
    }
};
