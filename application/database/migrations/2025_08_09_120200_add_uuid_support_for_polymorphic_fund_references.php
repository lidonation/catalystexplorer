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
        // Tables with polymorphic references that can point to Fund model
        $polymorphicTables = [
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

                // Backfill UUID for Fund model references
                DB::statement("
                    UPDATE {$table} 
                    SET temp_uuid_id = funds.uuid 
                    FROM funds 
                    WHERE {$table}.{$idColumn} = funds.id 
                    AND {$table}.{$typeColumn} = 'App\\\\Models\\\\Fund'
                ");
                
                // Change model_id column type to text to support both integers and UUIDs
                DB::statement("ALTER TABLE {$table} ALTER COLUMN {$idColumn} TYPE TEXT USING {$idColumn}::TEXT");
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $polymorphicTables = [
            ['table' => 'snapshots', 'id_column' => 'model_id'],
            ['table' => 'rankings', 'id_column' => 'model_id'],
            ['table' => 'txes', 'id_column' => 'model_id'],
        ];

        foreach ($polymorphicTables as $config) {
            $table = $config['table'];
            $idColumn = $config['id_column'];
            
            if (Schema::hasTable($table)) {
                // Revert column type back to bigint
                DB::statement("ALTER TABLE {$table} ALTER COLUMN {$idColumn} TYPE BIGINT USING {$idColumn}::BIGINT");
                
                if (Schema::hasColumn($table, 'temp_uuid_id')) {
                    Schema::table($table, function (Blueprint $table) {
                        $table->dropColumn('temp_uuid_id');
                    });
                }
            }
        }
    }
};
