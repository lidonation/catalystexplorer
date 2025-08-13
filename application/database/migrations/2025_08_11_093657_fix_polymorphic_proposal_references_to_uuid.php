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
        // Fix polymorphic model_id references from numeric to UUID for Proposal models
        
        $tables = [
            'action_events',
            'bookmark_items', 
            'discussions',
            'metas'
        ];
        
        $proposalClass = 'App\\Models\\Proposal';
        
        foreach ($tables as $tableName) {
            echo "Processing {$tableName}...\n";
            
            if (!Schema::hasTable($tableName) || !Schema::hasColumn($tableName, 'model_id') || !Schema::hasColumn($tableName, 'model_type')) {
                echo "Skipping {$tableName} - missing required columns\n";
                continue;
            }
            
            // Check how many Proposal references exist
            $proposalCount = DB::table($tableName)
                ->where('model_type', $proposalClass)
                ->count();
                
            if ($proposalCount === 0) {
                echo "{$tableName}: No Proposal references to update\n";
                continue;
            }
            
            echo "{$tableName}: Found {$proposalCount} Proposal references to update\n";
            
            // Check current model_id column type
            $columnInfo = DB::select(
                "SELECT data_type FROM information_schema.columns WHERE table_name = '{$tableName}' AND column_name = 'model_id'"
            );
            $currentType = $columnInfo[0]->data_type ?? 'unknown';
            
            if ($currentType === 'uuid') {
                echo "{$tableName}: model_id is already UUID, updating references...\n";
                
                // Update existing Proposal references to use new UUIDs
                $updated = DB::statement("
                    UPDATE {$tableName}
                    SET model_id = (
                        SELECT id::text
                        FROM proposals 
                        WHERE proposals.old_id = {$tableName}.model_id::bigint
                    )
                    WHERE model_type = '{$proposalClass}'
                    AND model_id IS NOT NULL
                ");
                
            } else {
                echo "{$tableName}: Converting model_id from {$currentType} to UUID...\n";
                
                // Add temporary text column for mixed UUID/integer IDs
                Schema::table($tableName, function (Blueprint $table) {
                    $table->text('model_uuid')->nullable()->after('model_id');
                });
                
                // Map Proposal model_id to UUIDs, keep other model types as-is
                if ($currentType === 'text') {
                    DB::statement("
                        UPDATE {$tableName}
                        SET model_uuid = CASE 
                            WHEN model_type = '{$proposalClass}' THEN (
                                SELECT id::text
                                FROM proposals 
                                WHERE proposals.old_id = {$tableName}.model_id::bigint
                            )
                            ELSE model_id
                        END
                        WHERE model_id IS NOT NULL
                    ");
                } else {
                    DB::statement("
                        UPDATE {$tableName}
                        SET model_uuid = CASE 
                            WHEN model_type = '{$proposalClass}' THEN (
                                SELECT id::text
                                FROM proposals 
                                WHERE proposals.old_id = {$tableName}.model_id
                            )
                            ELSE model_id::text
                        END
                        WHERE model_id IS NOT NULL
                    ");
                }
                
                // Check how many rows were mapped
                $mappedCount = DB::table($tableName)->whereNotNull('model_uuid')->count();
                echo "{$tableName}: {$mappedCount} total rows mapped to UUID\n";
                
                // Drop old model_id column
                Schema::table($tableName, function (Blueprint $table) {
                    $table->dropColumn('model_id');
                });
                
                // Rename model_uuid to model_id
                Schema::table($tableName, function (Blueprint $table) {
                    $table->renameColumn('model_uuid', 'model_id');
                });
            }
            
            echo "{$tableName}: ✅ Updated\n";
        }
        
        echo "\n✅ Fixed all polymorphic Proposal references to use UUIDs\n";
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        throw new \Exception('This migration cannot be reversed safely. Please restore from backup.');
    }
};
