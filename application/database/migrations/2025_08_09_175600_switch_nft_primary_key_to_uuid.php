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
        // Step 1: Drop the old primary key and rename uuid to id
        Schema::table('nfts', function (Blueprint $table) {
            $table->dropPrimary(['id']);
            $table->dropColumn('id');
        });

        Schema::table('nfts', function (Blueprint $table) {
            $table->renameColumn('uuid', 'id');
        });

        // Step 2: Set the new UUID column as primary key
        Schema::table('nfts', function (Blueprint $table) {
            $table->primary('id');
        });

        // Step 3: Update polymorphic references to use UUID
        $this->updatePolymorphicReferences();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // This is a destructive migration - once UUIDs are in place, 
        // we cannot easily revert to integer IDs without data loss
        throw new Exception('This migration cannot be reversed - UUID primary keys cannot be reverted to integers without data loss');
    }

    private function updatePolymorphicReferences(): void
    {
        $polymorphicTables = [
            'txes' => 'App\\Models\\Nft',
        ];

        foreach ($polymorphicTables as $tableName => $modelType) {
            if (Schema::hasTable($tableName)) {
                // Update model_id to use UUID values from model_uuid for this model type
                DB::statement("
                    UPDATE {$tableName} 
                    SET model_id = model_uuid 
                    WHERE model_type = ? 
                    AND model_uuid IS NOT NULL
                ", [$modelType]);
            }
        }
    }
};
