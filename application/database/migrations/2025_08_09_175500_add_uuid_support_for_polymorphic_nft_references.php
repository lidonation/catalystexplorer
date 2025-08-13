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
        // Add model_uuid column to tables with polymorphic references to NFTs
        $polymorphicTables = [
            'txes',
        ];

        foreach ($polymorphicTables as $table) {
            if (Schema::hasTable($table) && Schema::hasColumn($table, 'model_id')) {
                Schema::table($table, function (Blueprint $table) {
                    $table->uuid('model_uuid')->nullable()->after('model_type');
                });
            }
        }

        // Backfill model_uuid for NFT references
        foreach ($polymorphicTables as $tableName) {
            if (Schema::hasTable($tableName)) {
                DB::statement("
                    UPDATE {$tableName} 
                    SET model_uuid = nfts.uuid 
                    FROM nfts 
                    WHERE {$tableName}.model_id = CAST(nfts.id AS TEXT) 
                    AND {$tableName}.model_type = ?
                ", ['App\\Models\\Nft']);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $polymorphicTables = [
            'txes',
        ];

        foreach ($polymorphicTables as $table) {
            if (Schema::hasTable($table) && Schema::hasColumn($table, 'model_uuid')) {
                Schema::table($table, function (Blueprint $table) {
                    $table->dropColumn('model_uuid');
                });
            }
        }
    }
};
