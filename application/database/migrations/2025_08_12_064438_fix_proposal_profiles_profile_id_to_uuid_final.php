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
        // Map proposal_profiles.profile_id from numeric strings to UUIDs for IdeascaleProfile entries
        $mapped = 0;
        
        // Process in batches to handle large datasets
        $batchSize = 1000;
        $offset = 0;
        
        do {
            $batch = DB::table('proposal_profiles')
                ->where('profile_type', 'App\\Models\\IdeascaleProfile')
                ->whereRaw("profile_id ~ '^[0-9]+$'")
                ->offset($offset)
                ->limit($batchSize)
                ->get(['id', 'profile_id']);
            
            foreach ($batch as $row) {
                $numericId = (int) $row->profile_id;
                
                // Find the corresponding UUID from ideascale_profiles.old_id
                $profile = DB::table('ideascale_profiles')
                    ->where('old_id', $numericId)
                    ->first(['id']);
                
                if ($profile) {
                    DB::table('proposal_profiles')
                        ->where('id', $row->id)
                        ->update(['profile_id' => $profile->id]);
                    $mapped++;
                }
            }
            
            $offset += $batchSize;
        } while (count($batch) === $batchSize);
        
        echo "Mapped {$mapped} proposal_profiles entries from numeric IDs to UUIDs\n";
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // This migration is irreversible as we don't store the original numeric values
        echo "Warning: This migration cannot be reversed\n";
    }
};
