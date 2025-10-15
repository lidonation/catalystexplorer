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
        // Read the SQL file and process the data
        $sqlFile = database_path('sql/cx.consumed_voting_powers.sql');
        
        if (!file_exists($sqlFile)) {
            echo "SQL file not found: " . $sqlFile . "\n";
            return;
        }
        
        $sql = file_get_contents($sqlFile);
        $lines = explode("\n", $sql);
        
        $updates = [];
        $batchSize = 1000;
        $processed = 0;
        
        foreach ($lines as $line) {
            // Look for INSERT statements - match lines with parentheses containing data
            if (preg_match('/^\(\d+,\s*\d+,\s*\'([^\']*)\',\s*\'([^\']*)\',\s*\'([tf])\',\s*(\d+)\)/', $line, $matches)) {
                $snapshot_id = $matches[1];
                $voter_id = $matches[2];
                $consumed = $matches[3] === 't' ? true : false;
                $votes_cast = intval($matches[4]);
                
                $updates[] = [
                    'snapshot_id' => $snapshot_id,
                    'voter_id' => $voter_id,
                    'consumed' => $consumed,
                    'votes_cast' => $votes_cast
                ];
                
                // Process in batches
                if (count($updates) >= $batchSize) {
                    $processed += $this->processUpdates($updates);
                    $updates = [];
                    echo "Processed {$processed} records so far...\n";
                }
            }
        }
        
        // Process remaining updates
        if (!empty($updates)) {
            $processed += $this->processUpdates($updates);
        }
        
        echo "Voting powers consumed/votes_cast data updated successfully. Total processed: {$processed}\n";
    }
    
    private function processUpdates(array $updates): int
    {
        $updated = 0;
        foreach ($updates as $update) {
            $result = DB::table('voting_powers')
                ->where('snapshot_id', $update['snapshot_id'])
                ->where('voter_id', $update['voter_id'])
                ->update([
                    'consumed' => $update['consumed'],
                    'votes_cast' => $update['votes_cast']
                ]);
            $updated += $result;
        }
        return $updated;
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Reset consumed and votes_cast to their default values
        DB::table('voting_powers')
            ->update([
                'consumed' => null,
                'votes_cast' => 0
            ]);
    }
};
