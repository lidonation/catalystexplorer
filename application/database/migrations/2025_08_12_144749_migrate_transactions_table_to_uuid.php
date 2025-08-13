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
            echo "Migrating transactions table to UUID primary key...\n";
            
            $this->migrateTransactionsToUuid();
        });
    }
    
    private function migrateTransactionsToUuid(): void
    {
        echo "Converting transactions table primary key to UUID...\n";
        
        $recordCount = DB::table('transactions')->count();
        echo "Processing {$recordCount} transaction records...\n";
        
        // Add UUID column
        Schema::table('transactions', function (Blueprint $table) {
            $table->uuid('uuid')->nullable()->after('id');
        });
        
        // Process records in batches for performance
        $batchSize = 1000;
        $processed = 0;
        
        while ($processed < $recordCount) {
            echo "Processing batch starting at offset {$processed}...\n";
            
            $transactions = DB::table('transactions')
                ->select('id')
                ->offset($processed)
                ->limit($batchSize)
                ->get();
            
            foreach ($transactions as $transaction) {
                DB::table('transactions')
                    ->where('id', $transaction->id)
                    ->update(['uuid' => Str::uuid()]);
            }
            
            $processed += $batchSize;
        }
        
        echo "Generated UUIDs for all transaction records.\n";
        
        // Make uuid non-nullable
        if ($recordCount > 0) {
            Schema::table('transactions', function (Blueprint $table) {
                $table->uuid('uuid')->nullable(false)->change();
            });
        }
        
        // Drop old primary key and rename columns
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropPrimary();
            $table->renameColumn('id', 'old_id');
            $table->renameColumn('uuid', 'id');
        });
        
        // Add new primary key
        Schema::table('transactions', function (Blueprint $table) {
            $table->primary('id');
        });
        
        echo "Transactions table migration to UUID completed.\n";
        
        // Add index on old_id for performance during any lookups
        Schema::table('transactions', function (Blueprint $table) {
            $table->index('old_id', 'transactions_old_id_index');
        });
        
        echo "Added index on old_id column.\n";
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::transaction(function () {
            echo "Reverting transactions table back to bigint primary key...\n";
            
            // Drop the old_id index
            Schema::table('transactions', function (Blueprint $table) {
                $table->dropIndex('transactions_old_id_index');
            });
            
            // Drop current primary key and rename columns back
            Schema::table('transactions', function (Blueprint $table) {
                $table->dropPrimary();
                $table->renameColumn('id', 'uuid');
                $table->renameColumn('old_id', 'id');
            });
            
            // Add original primary key
            Schema::table('transactions', function (Blueprint $table) {
                $table->primary('id');
            });
            
            // Drop UUID column
            Schema::table('transactions', function (Blueprint $table) {
                $table->dropColumn('uuid');
            });
            
            echo "Transactions table reverted to bigint primary key.\n";
        });
    }
};
