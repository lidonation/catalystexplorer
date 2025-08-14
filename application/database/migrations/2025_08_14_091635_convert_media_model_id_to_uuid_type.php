<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Disable automatic transaction wrapping to handle large datasets.
     */
    public $withinTransaction = false;

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Convert the model_id column from text to UUID type
        // Since all values are already valid UUID strings, we can use USING model_id::UUID
        DB::statement('ALTER TABLE media ALTER COLUMN model_id TYPE UUID USING model_id::UUID');
        
        echo "\n✅ Successfully converted media.model_id column from text to UUID type\n";
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Convert back from UUID to text
        DB::statement('ALTER TABLE media ALTER COLUMN model_id TYPE TEXT USING model_id::TEXT');
        
        echo "\n✅ Successfully reverted media.model_id column from UUID to text type\n";
    }
};
