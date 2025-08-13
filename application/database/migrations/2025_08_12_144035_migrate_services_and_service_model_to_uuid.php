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
            echo "Migrating services and service_model tables to UUID...\n";
            
            // First, drop the foreign key constraint from service_model
            $this->dropServiceModelForeignKeys();
            
            // Migrate services table to UUID
            $this->migrateServicesTableToUuid();
            
            // Migrate service_model pivot table to UUID
            $this->migrateServiceModelTableToUuid();
            
            // Recreate foreign key constraints
            $this->recreateForeignKeyConstraints();
        });
    }
    
    private function dropServiceModelForeignKeys(): void
    {
        echo "Dropping foreign key constraints from service_model table...\n";
        
        try {
            Schema::table('service_model', function (Blueprint $table) {
                $table->dropForeign(['service_id']);
            });
        } catch (Exception $e) {
            echo "No service_id foreign key to drop or already dropped.\n";
        }
    }
    
    private function migrateServicesTableToUuid(): void
    {
        echo "Migrating services table to UUID primary key...\n";
        
        // Add UUID column
        Schema::table('services', function (Blueprint $table) {
            $table->uuid('uuid')->nullable()->after('id');
        });
        
        // Generate UUIDs for existing records
        $services = DB::table('services')->get();
        foreach ($services as $service) {
            DB::table('services')
                ->where('id', $service->id)
                ->update(['uuid' => Str::uuid()]);
        }
        
        // Make uuid non-nullable if there are records
        if ($services->count() > 0) {
            Schema::table('services', function (Blueprint $table) {
                $table->uuid('uuid')->nullable(false)->change();
            });
        }
        
        // Drop old primary key and rename columns
        Schema::table('services', function (Blueprint $table) {
            $table->dropPrimary();
            $table->renameColumn('id', 'old_id');
            $table->renameColumn('uuid', 'id');
        });
        
        // Add new primary key
        Schema::table('services', function (Blueprint $table) {
            $table->primary('id');
        });
        
        // Fix user relationship - map user_id to user_uuid if it exists
        if (Schema::hasColumn('services', 'user_uuid')) {
            echo "Updating user references to use UUID...\n";
            
            // Drop old user_id and rename user_uuid to user_id
            Schema::table('services', function (Blueprint $table) {
                $table->dropColumn('user_id');
                $table->renameColumn('user_uuid', 'user_id');
            });
        }
        
        echo "Services table migration completed.\n";
    }
    
    private function migrateServiceModelTableToUuid(): void
    {
        echo "Migrating service_model pivot table to UUID...\n";
        
        // Add UUID columns
        Schema::table('service_model', function (Blueprint $table) {
            $table->uuid('uuid')->nullable()->after('id');
            $table->uuid('service_uuid')->nullable()->after('service_id');
            $table->uuid('model_uuid')->nullable()->after('model_id');
        });
        
        // Generate UUIDs for existing records
        $serviceModels = DB::table('service_model')->get();
        foreach ($serviceModels as $serviceModel) {
            $updateData = ['uuid' => Str::uuid()];
            
            // Map service_id to service UUID
            $service = DB::table('services')->where('old_id', $serviceModel->service_id)->first();
            if ($service) {
                $updateData['service_uuid'] = $service->id;
            }
            
            // Map model_id based on model_type
            if ($serviceModel->model_type && $serviceModel->model_id) {
                $modelUuid = $this->getModelUuid($serviceModel->model_type, $serviceModel->model_id);
                if ($modelUuid) {
                    $updateData['model_uuid'] = $modelUuid;
                }
            }
            
            DB::table('service_model')
                ->where('id', $serviceModel->id)
                ->update($updateData);
        }
        
        // Make uuid columns non-nullable if there are records
        if ($serviceModels->count() > 0) {
            Schema::table('service_model', function (Blueprint $table) {
                $table->uuid('uuid')->nullable(false)->change();
            });
        }
        
        // Drop old columns and rename new ones
        Schema::table('service_model', function (Blueprint $table) {
            $table->dropPrimary();
            $table->renameColumn('id', 'old_id');
            $table->renameColumn('uuid', 'id');
            $table->renameColumn('service_id', 'old_service_id');
            $table->renameColumn('service_uuid', 'service_id');
            $table->renameColumn('model_id', 'old_model_id');
            $table->renameColumn('model_uuid', 'model_id');
        });
        
        // Add new primary key
        Schema::table('service_model', function (Blueprint $table) {
            $table->primary('id');
        });
        
        echo "service_model pivot table migration completed.\n";
    }
    
    private function getModelUuid(string $modelType, int $modelId): ?string
    {
        // Map different model types to their UUID equivalents
        switch ($modelType) {
            case 'App\\Models\\Category':
                $model = DB::table('categories')->where('old_id', $modelId)->first();
                return $model ? $model->id : null;
                
            case 'App\\Models\\Location':
                $model = DB::table('locations')->where('old_id', $modelId)->first();
                return $model ? $model->id : null;
                
            case 'App\\Models\\Fund':
                $model = DB::table('funds')->where('old_id', $modelId)->first();
                return $model ? $model->id : null;
                
            case 'App\\Models\\Proposal':
                $model = DB::table('proposals')->where('old_id', $modelId)->first();
                return $model ? $model->id : null;
                
            default:
                echo "Warning: Unknown model type {$modelType} with ID {$modelId}\n";
                return null;
        }
    }
    
    private function recreateForeignKeyConstraints(): void
    {
        echo "Recreating foreign key constraints...\n";
        
        // Add foreign key for service_model.service_id -> services.id
        Schema::table('service_model', function (Blueprint $table) {
            $table->foreign('service_id')->references('id')->on('services')->onDelete('cascade');
        });
        
        echo "Foreign key constraints recreated.\n";
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::transaction(function () {
            // Drop foreign keys
            Schema::table('service_model', function (Blueprint $table) {
                $table->dropForeign(['service_id']);
            });
            
            // Reverse service_model changes
            Schema::table('service_model', function (Blueprint $table) {
                $table->dropPrimary();
                $table->renameColumn('id', 'uuid');
                $table->renameColumn('old_id', 'id');
                $table->renameColumn('service_id', 'service_uuid');
                $table->renameColumn('old_service_id', 'service_id');
                $table->renameColumn('model_id', 'model_uuid');
                $table->renameColumn('old_model_id', 'model_id');
            });
            
            Schema::table('service_model', function (Blueprint $table) {
                $table->primary('id');
                $table->dropColumn(['uuid', 'service_uuid', 'model_uuid']);
            });
            
            // Reverse services changes
            Schema::table('services', function (Blueprint $table) {
                $table->dropPrimary();
                $table->renameColumn('id', 'uuid');
                $table->renameColumn('old_id', 'id');
            });
            
            Schema::table('services', function (Blueprint $table) {
                $table->primary('id');
                $table->dropColumn('uuid');
            });
            
            // Restore original foreign keys
            Schema::table('service_model', function (Blueprint $table) {
                $table->foreign('service_id')->references('id')->on('services')->onDelete('cascade');
            });
        });
    }
};
