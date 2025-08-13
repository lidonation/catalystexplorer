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
        // Tables with polymorphic references that can point to Group model
        $polymorphicTables = [
            ['table' => 'bookmark_items', 'id_column' => 'model_id', 'type_column' => 'model_type'],
            ['table' => 'snapshots', 'id_column' => 'model_id', 'type_column' => 'model_type'],
            ['table' => 'rankings', 'id_column' => 'model_id', 'type_column' => 'model_type'],
            ['table' => 'txes', 'id_column' => 'model_id', 'type_column' => 'model_type'],
        ];

        foreach ($polymorphicTables as $config) {
            $table = $config['table'];
            $idColumn = $config['id_column'];
            $typeColumn = $config['type_column'];

            if (Schema::hasTable($table) && Schema::hasColumn($table, $idColumn)) {
                // Add temporary UUID column
                Schema::table($table, function (Blueprint $table) use ($idColumn) {
                    $table->uuid('temp_uuid_id')->nullable()->after($idColumn);
                });

                // Check current column type to determine how to do the comparison
                $columnType = DB::select("
                    SELECT data_type 
                    FROM information_schema.columns 
                    WHERE table_name = '{$table}' AND column_name = '{$idColumn}'
                ")[0]->data_type ?? null;
                
                // Backfill UUID for Group model references with appropriate casting
                if ($columnType === 'text') {
                    // model_id is already text (from Fund migration)
                    DB::statement("
                        UPDATE {$table} 
                        SET temp_uuid_id = groups.uuid 
                        FROM groups 
                        WHERE {$table}.{$idColumn} = groups.id::text 
                        AND {$table}.{$typeColumn} = 'App\\\\\\\\Models\\\\\\\\Group'
                    ");
                } else {
                    // model_id is still bigint/integer
                    DB::statement("
                        UPDATE {$table} 
                        SET temp_uuid_id = groups.uuid 
                        FROM groups 
                        WHERE {$table}.{$idColumn} = groups.id 
                        AND {$table}.{$typeColumn} = 'App\\\\\\\\Models\\\\\\\\Group'
                    ");
                }
                
                // Change model_id column type to text to support both integers and UUIDs
                // (Only if it's not already text from Fund migration)
                if ($columnType !== 'text') {
                    DB::statement("ALTER TABLE {$table} ALTER COLUMN {$idColumn} TYPE TEXT USING {$idColumn}::TEXT");
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $polymorphicTables = ['bookmark_items', 'snapshots', 'rankings', 'txes'];

        foreach ($polymorphicTables as $table) {
            if (Schema::hasTable($table) && Schema::hasColumn($table, 'temp_uuid_id')) {
                Schema::table($table, function (Blueprint $table) {
                    $table->dropColumn('temp_uuid_id');
                });
            }
        }
    }
};
