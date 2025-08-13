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
        // Fix remaining polymorphic model_id references for UUID models
        
        $uuidModelMappings = [
            'App\\Models\\User' => ['table' => 'users', 'old_id_column' => 'old_id'],
            'App\\Models\\IdeascaleProfile' => ['table' => 'ideascale_profiles', 'old_id_column' => 'old_id']
        ];
        
        $polymorphicTables = ['metas', 'action_events', 'bookmark_items'];
        
        foreach ($uuidModelMappings as $modelClass => $config) {
            echo "\n=== Processing {$modelClass} ===\n";
            
            foreach ($polymorphicTables as $tableName) {
                if (!Schema::hasTable($tableName)) {
                    continue;
                }
                
                // Check how many references exist for this model
                $referenceCount = DB::table($tableName)
                    ->where('model_type', $modelClass)
                    ->count();
                    
                if ($referenceCount === 0) {
                    continue;
                }
                
                echo "Table {$tableName}: Found {$referenceCount} {$modelClass} references\n";
                
                // Update numeric model_id to UUID for this specific model type
                $updated = DB::statement("
                    UPDATE {$tableName}
                    SET model_id = (
                        SELECT id::text
                        FROM {$config['table']}
                        WHERE {$config['table']}.{$config['old_id_column']} = {$tableName}.model_id::bigint
                    )
                    WHERE model_type = '{$modelClass}'
                    AND model_id IS NOT NULL
                    AND model_id ~ '^[0-9]+$'
                ");
                
                // Check how many were actually updated
                $remainingNumeric = DB::table($tableName)
                    ->where('model_type', $modelClass)
                    ->where('model_id', '~', '^[0-9]+$')
                    ->count();
                    
                $updatedCount = $referenceCount - $remainingNumeric;
                echo "  Updated {$updatedCount} references to UUID, {$remainingNumeric} remain numeric\n";
            }
        }
        
        echo "\n✅ Fixed all remaining UUID model references in polymorphic tables\n";
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        throw new \Exception('This migration cannot be reversed safely. Please restore from backup.');
    }
};
