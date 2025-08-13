<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Ramsey\Uuid\Uuid;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('catalyst_profiles', function (Blueprint $table) {
            // Add uuid column
            $table->uuid('uuid')->nullable()->after('id');
            // Add old_id column to preserve the original bigint ID
            $table->bigInteger('old_id')->nullable()->after('uuid');
            // Add index on uuid for performance
            $table->index('uuid');
        });

        // Generate UUIDs for existing records and populate old_id
        $batchSize = 1000;
        $offset = 0;
        $updated = 0;

        do {
            $profiles = DB::table('catalyst_profiles')
                ->whereNull('uuid')
                ->offset($offset)
                ->limit($batchSize)
                ->get(['id']);

            foreach ($profiles as $profile) {
                DB::table('catalyst_profiles')
                    ->where('id', $profile->id)
                    ->update([
                        'uuid' => Uuid::uuid4()->toString(),
                        'old_id' => $profile->id
                    ]);
                $updated++;
            }

            $offset += $batchSize;
        } while (count($profiles) === $batchSize);

        echo "Generated UUIDs for {$updated} catalyst_profiles\n";

        // Make uuid column non-nullable after populating
        Schema::table('catalyst_profiles', function (Blueprint $table) {
            $table->uuid('uuid')->nullable(false)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('catalyst_profiles', function (Blueprint $table) {
            $table->dropIndex(['uuid']);
            $table->dropColumn(['uuid', 'old_id']);
        });
    }
};
