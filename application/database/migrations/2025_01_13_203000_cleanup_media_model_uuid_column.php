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
        echo "Cleaning up temporary model_uuid column from media table...\n";

        // Show final statistics before cleanup
        $stats = DB::select("
            SELECT model_type, COUNT(*) as total,
            COUNT(CASE WHEN model_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN 1 END) as uuid_records,
            COUNT(CASE WHEN model_id ~ '^[0-9]+$' THEN 1 END) as numeric_records
            FROM media 
            GROUP BY model_type 
            ORDER BY model_type
        ");
        
        echo "Final media table statistics:\n";
        foreach ($stats as $stat) {
            echo "  {$stat->model_type}: {$stat->total} total ({$stat->uuid_records} UUID, {$stat->numeric_records} numeric)\n";
        }

        // Drop the temporary model_uuid column and its index
        Schema::table('media', function (Blueprint $table) {
            $table->dropIndex('media_model_type_model_uuid_index');
            $table->dropIndex('media_model_uuid_index');
            $table->dropColumn('model_uuid');
        });

        echo "\nRemoved temporary model_uuid column and related indexes.\n";
        echo "Media table UUID migration is fully complete!\n";

        // Show final table structure
        echo "\n=== Final Media Table Structure ===\n";
        $columns = DB::select("
            SELECT column_name, data_type, is_nullable 
            FROM information_schema.columns 
            WHERE table_name = 'media' 
            ORDER BY ordinal_position
        ");
        
        foreach ($columns as $column) {
            echo "  {$column->column_name}: {$column->data_type} " . ($column->is_nullable === 'YES' ? '(nullable)' : '(not null)') . "\n";
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        echo "Restoring model_uuid column to media table...\n";

        Schema::table('media', function (Blueprint $table) {
            $table->uuid('model_uuid')->nullable()->after('model_id');
            $table->index(['model_type', 'model_uuid'], 'media_model_type_model_uuid_index');
            $table->index('model_uuid', 'media_model_uuid_index');
        });

        // Repopulate model_uuid for UUID-based models
        DB::statement("
            UPDATE media 
            SET model_uuid = model_id::uuid 
            WHERE model_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        ");

        echo "Restored model_uuid column and indexes.\n";
    }
};
