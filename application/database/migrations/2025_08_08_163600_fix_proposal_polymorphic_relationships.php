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
        $this->fixPolymorphicTable('metas');
        $this->fixPolymorphicTable('ratings');
        $this->fixPolymorphicTable('reviews');
        $this->fixPolymorphicTable('discussions');
        $this->fixPolymorphicTable('bookmark_items');
        $this->fixPolymorphicTable('rankings');
        $this->fixPolymorphicTable('nfts');
        $this->fixPolymorphicTable('catalyst_snapshots');
        $this->fixPolymorphicTable('model_tag');
        $this->fixPolymorphicTable('model_has_permissions');
        $this->fixPolymorphicTable('model_has_roles');
        $this->fixPolymorphicTable('model_signature');
        $this->fixPolymorphicTable('catalyst_connections');
        $this->fixPolymorphicTable('model_has_location');
        $this->fixPolymorphicTable('txes');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // This migration should not be reversed as it fixes critical data integrity issues
    }

    private function fixPolymorphicTable(string $tableName): void
    {
        if (!Schema::hasTable($tableName)) {
            echo "Table {$tableName} does not exist, skipping...\n";
            return;
        }

        if (!Schema::hasColumn($tableName, 'model_id') || !Schema::hasColumn($tableName, 'model_type')) {
            echo "Table {$tableName} does not have polymorphic columns, skipping...\n";
            return;
        }

        echo "Fixing polymorphic table: {$tableName}\n";

        try {
            DB::beginTransaction();

            // Check current data type of model_id column
            $modelIdType = DB::select("SELECT data_type FROM information_schema.columns WHERE table_name = ? AND column_name = 'model_id'", [$tableName]);
            
            if (empty($modelIdType)) {
                echo "Could not determine model_id column type for {$tableName}, skipping...\n";
                DB::rollBack();
                return;
            }

            $currentType = $modelIdType[0]->data_type;
            echo "Current model_id type in {$tableName}: {$currentType}\n";

            // If it's already a string type, check if we need to update proposal references
            if (in_array($currentType, ['character varying', 'varchar', 'text'])) {
                echo "model_id column is already string type in {$tableName}\n";
                
                // Update any proposal references that might have integer IDs
                $updateCount = DB::statement("
                    UPDATE {$tableName} 
                    SET model_id = proposals.id 
                    FROM proposals 
                    WHERE proposals.legacy_id::varchar = {$tableName}.model_id 
                    AND {$tableName}.model_type = 'App\\Models\\Proposal'
                ");

                echo "Updated {$updateCount} proposal references in {$tableName}\n";
            } else {
                // It's an integer type, need to convert
                echo "Converting model_id column from {$currentType} to varchar in {$tableName}\n";

                // Add temporary UUID column
                if (!Schema::hasColumn($tableName, 'model_uuid_temp')) {
                    Schema::table($tableName, function (Blueprint $table) {
                        $table->string('model_uuid_temp')->nullable();
                    });
                }

                // Update proposal references
                $proposalUpdateCount = DB::statement("
                    UPDATE {$tableName} 
                    SET model_uuid_temp = proposals.id 
                    FROM proposals 
                    WHERE proposals.legacy_id = {$tableName}.model_id::bigint 
                    AND {$tableName}.model_type = 'App\\Models\\Proposal'
                ");

                echo "Updated {$proposalUpdateCount} proposal references in {$tableName}\n";

                // For other model types that might use integer IDs, copy the existing value
                $otherUpdateCount = DB::table($tableName)
                    ->where('model_type', '!=', 'App\\Models\\Proposal')
                    ->whereNull('model_uuid_temp')
                    ->update([
                        'model_uuid_temp' => DB::raw('CAST(model_id AS varchar)')
                    ]);

                echo "Updated {$otherUpdateCount} other model references in {$tableName}\n";

                // Drop the old model_id column and rename temp column
                Schema::table($tableName, function (Blueprint $table) {
                    $table->dropColumn('model_id');
                });

                Schema::table($tableName, function (Blueprint $table) {
                    $table->renameColumn('model_uuid_temp', 'model_id');
                });

                echo "Successfully converted model_id column to varchar in {$tableName}\n";
            }

            DB::commit();
            echo "Successfully fixed polymorphic table: {$tableName}\n\n";
        } catch (Exception $e) {
            DB::rollBack();
            echo "Error fixing table {$tableName}: " . $e->getMessage() . "\n\n";
        }
    }
};
