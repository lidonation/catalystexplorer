<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::transaction(function () {
            echo "Migrating rules table to use UUID model_id references...\n";
            
            // First, migrate rules table primary key to UUID
            $this->migrateRulesPrimaryKeyToUuid();
            
            // Then fix the polymorphic model_id references
            $this->fixPolymorphicModelIdReferences();
        });
    }
    
    private function migrateRulesPrimaryKeyToUuid(): void
    {
        echo "Converting rules table primary key to UUID...\n";
        
        // Add UUID column for primary key
        Schema::table('rules', function (Blueprint $table) {
            $table->uuid('uuid')->nullable()->after('id');
        });
        
        // Generate UUIDs for existing records
        $rules = DB::table('rules')->get();
        foreach ($rules as $rule) {
            DB::table('rules')
                ->where('id', $rule->id)
                ->update(['uuid' => Str::uuid()]);
        }
        
        // Make uuid non-nullable
        if ($rules->count() > 0) {
            Schema::table('rules', function (Blueprint $table) {
                $table->uuid('uuid')->nullable(false)->change();
            });
        }
        
        // Drop old primary key and rename columns
        Schema::table('rules', function (Blueprint $table) {
            $table->dropPrimary();
            $table->renameColumn('id', 'old_id');
            $table->renameColumn('uuid', 'id');
        });
        
        // Add new primary key
        Schema::table('rules', function (Blueprint $table) {
            $table->primary('id');
        });
        
        echo "Rules primary key migration completed.\n";
    }
    
    private function fixPolymorphicModelIdReferences(): void
    {
        echo "Fixing polymorphic model_id references in rules table...\n";
        
        // Add UUID column for model_id
        Schema::table('rules', function (Blueprint $table) {
            $table->uuid('model_uuid')->nullable()->after('model_id');
        });
        
        // Process Metric model references
        $metricRules = DB::table('rules')
            ->where('model_type', 'App\\Models\\Metric')
            ->whereNotNull('model_id')
            ->get();
            
        $mappedCount = 0;
        $orphanedCount = 0;
        
        foreach ($metricRules as $rule) {
            // Find the metric by old_id
            $metric = DB::table('metrics')
                ->where('old_id', $rule->model_id)
                ->first();
            
            if ($metric) {
                DB::table('rules')
                    ->where('id', $rule->id)
                    ->update(['model_uuid' => $metric->id]);
                $mappedCount++;
            } else {
                echo "Warning: Metric with old_id {$rule->model_id} not found for rule {$rule->id}\n";
                $orphanedCount++;
            }
        }
        
        echo "Mapped {$mappedCount} metric references, {$orphanedCount} orphaned references.\n";
        
        // Replace model_id column
        Schema::table('rules', function (Blueprint $table) {
            $table->renameColumn('model_id', 'old_model_id');
            $table->renameColumn('model_uuid', 'model_id');
        });
        
        echo "Rules model_id references fixed.\n";
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::transaction(function () {
            // Reverse model_id changes
            Schema::table('rules', function (Blueprint $table) {
                $table->bigInteger('model_bigint')->nullable()->after('model_id');
            });
            
            // Map UUIDs back to bigint IDs for metrics
            $metricRules = DB::table('rules')
                ->where('model_type', 'App\\Models\\Metric')
                ->whereNotNull('model_id')
                ->get();
                
            foreach ($metricRules as $rule) {
                $metric = DB::table('metrics')->where('id', $rule->model_id)->first();
                if ($metric && isset($metric->old_id)) {
                    DB::table('rules')
                        ->where('id', $rule->id)
                        ->update(['model_bigint' => $metric->old_id]);
                }
            }
            
            Schema::table('rules', function (Blueprint $table) {
                $table->renameColumn('model_id', 'model_uuid');
                $table->renameColumn('model_bigint', 'model_id');
                $table->renameColumn('old_model_id', 'old_model_uuid');
            });
            
            // Reverse primary key changes
            Schema::table('rules', function (Blueprint $table) {
                $table->dropPrimary();
                $table->renameColumn('id', 'uuid');
                $table->renameColumn('old_id', 'id');
            });
            
            Schema::table('rules', function (Blueprint $table) {
                $table->primary('id');
                $table->dropColumn('uuid');
            });
        });
    }
};
