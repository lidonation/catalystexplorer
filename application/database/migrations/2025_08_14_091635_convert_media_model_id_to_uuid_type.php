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
        // Disable automatic transactions to prevent rollback issues
        Schema::disableForeignKeyConstraints();
        
        // Convert media.model_id from text to UUID
        DB::statement('ALTER TABLE media ALTER COLUMN model_id TYPE UUID USING model_id::UUID');
        
        Schema::enableForeignKeyConstraints();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Disable automatic transactions to prevent rollback issues
        Schema::disableForeignKeyConstraints();
        
        // Convert media.model_id from UUID back to text
        DB::statement('ALTER TABLE media ALTER COLUMN model_id TYPE TEXT USING model_id::TEXT');
        
        Schema::enableForeignKeyConstraints();
    }
};
