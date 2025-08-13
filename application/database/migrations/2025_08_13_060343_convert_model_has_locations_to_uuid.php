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
        echo "Converting model_has_locations table to use UUIDs...\n";
        
        // Check if table has any data
        $recordCount = DB::table('model_has_locations')->count();
        echo "Found {$recordCount} records in model_has_locations table.\n";
        
        if ($recordCount > 0) {
            throw new \Exception("model_has_locations table contains data. This migration requires manual data conversion. Please implement data mapping logic.");
        }
        
        // Since the table is empty, we can directly change the column types using raw SQL
        // Convert model_id from bigint to uuid
        DB::statement('ALTER TABLE model_has_locations ALTER COLUMN model_id TYPE uuid USING model_id::text::uuid');
        
        // Convert location_id from bigint to uuid
        DB::statement('ALTER TABLE model_has_locations ALTER COLUMN location_id TYPE uuid USING location_id::text::uuid');
        
        // Add foreign key constraint to locations table
        Schema::table('model_has_locations', function (Blueprint $table) {
            $table->foreign('location_id')->references('id')->on('locations')->onDelete('cascade');
        });
        
        echo "Successfully converted model_has_locations table to use UUIDs.\n";
        echo "- model_id: bigint -> uuid\n";
        echo "- location_id: bigint -> uuid (with foreign key to locations.id)\n";
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        echo "Reverting model_has_locations table to use bigint...\n";
        
        // Drop foreign key constraint first
        Schema::table('model_has_locations', function (Blueprint $table) {
            $table->dropForeign(['location_id']);
        });
        
        // Convert back to bigint
        Schema::table('model_has_locations', function (Blueprint $table) {
            // Convert model_id from uuid back to bigint
            $table->bigInteger('model_id')->change();
            
            // Convert location_id from uuid back to bigint
            $table->bigInteger('location_id')->change();
        });
        
        echo "Successfully reverted model_has_locations table to use bigint.\n";
    }
};
