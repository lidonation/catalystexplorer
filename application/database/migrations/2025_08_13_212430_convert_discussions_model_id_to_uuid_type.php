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
        DB::transaction(function () {
            // Verify all model_id values are valid UUIDs before conversion
            $invalidUuids = DB::table('discussions')
                ->whereRaw('model_id !~ \'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$\'')
                ->count();

            if ($invalidUuids > 0) {
                throw new Exception("Cannot convert model_id to UUID: $invalidUuids invalid UUID values found");
            }

            echo "All model_id values are valid UUIDs, proceeding with type conversion\n";

            // Convert model_id column from text to UUID
            DB::statement('ALTER TABLE discussions ALTER COLUMN model_id TYPE UUID USING model_id::UUID');

            // Verify the conversion
            $columnType = DB::select("
                SELECT data_type 
                FROM information_schema.columns 
                WHERE table_name = 'discussions' 
                AND column_name = 'model_id'
            ")[0]->data_type;

            echo "Successfully converted discussions.model_id to UUID type (now: $columnType)\n";

            // Count records by model type for verification
            $counts = DB::table('discussions')
                ->select('model_type', DB::raw('count(*) as count'))
                ->groupBy('model_type')
                ->get();

            echo "Record counts after conversion:\n";
            foreach ($counts as $count) {
                echo "  {$count->model_type}: {$count->count}\n";
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::transaction(function () {
            // Convert UUID back to text
            DB::statement('ALTER TABLE discussions ALTER COLUMN model_id TYPE TEXT USING model_id::TEXT');

            echo "Reverted discussions.model_id back to TEXT type\n";
        });
    }
};
