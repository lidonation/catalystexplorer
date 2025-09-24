<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Update all null context_id values to Fund 14 UUID
        // b77b307e-2e83-4f9d-8be1-ba9f600299f3 = Fund FOURTEEN from CatalystFunds enum
        DB::table('catalyst_tallies')
            ->whereNull('context_id')
            ->update([
                'context_id' => 'b77b307e-2e83-4f9d-8be1-ba9f600299f3',
                'context_type' => 'App\\Models\\Fund',
                'updated_at' => now()
            ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert Fund 14 context_id values back to null
        // Note: This rollback assumes these were the records we updated
        DB::table('catalyst_tallies')
            ->where('context_id', 'b77b307e-2e83-4f9d-8be1-ba9f600299f3')
            ->where('context_type', 'App\\Models\\Fund')
            ->update([
                'context_id' => null,
                'context_type' => null,
                'updated_at' => now()
            ]);
    }
};