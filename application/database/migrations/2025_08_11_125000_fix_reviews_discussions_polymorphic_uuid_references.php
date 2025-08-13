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
        echo "\n=== Fixing polymorphic UUID references in reviews and discussions tables ===\n";
        
        // First, change the model_id column type to TEXT to support both bigint and UUID
        Schema::table('reviews', function (Blueprint $table) {
            $table->text('model_id')->nullable()->change();
        });
        
        Schema::table('discussions', function (Blueprint $table) {
            $table->text('model_id')->nullable()->change();
        });
        
        // Define UUID model mappings
        $uuidModelMappings = [
            'App\\Models\\Proposal' => ['table' => 'proposals', 'old_id_column' => 'old_id'],
            'App\\Models\\IdeascaleProfile' => ['table' => 'ideascale_profiles', 'old_id_column' => 'old_id'],
            'App\\Models\\Group' => ['table' => 'groups', 'old_id_column' => 'old_id'],
            'App\\Models\\Fund' => ['table' => 'funds', 'old_id_column' => 'old_id'],
            'App\\Models\\User' => ['table' => 'users', 'old_id_column' => 'old_id']
        ];
        
        $polymorphicTables = ['reviews', 'discussions'];
        
        foreach ($uuidModelMappings as $modelClass => $config) {
            echo "\n=== Processing {$modelClass} ===\n";
            
            foreach ($polymorphicTables as $tableName) {
                // Check if the model mapping table exists and has the old_id_column
                if (!Schema::hasTable($config['table']) || !Schema::hasColumn($config['table'], $config['old_id_column'])) {
                    echo "Skipping {$config['table']} - table or old_id column doesn't exist\n";
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
                try {
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
                    
                } catch (\Exception $e) {
                    echo "  Error updating {$tableName} for {$modelClass}: " . $e->getMessage() . "\n";
                }
            }
        }
        
        echo "\n✅ Fixed polymorphic UUID references in reviews and discussions tables\n";
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        throw new \Exception('This migration cannot be reversed safely. Please restore from backup.');
    }
};
