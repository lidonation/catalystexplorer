<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\Proposal;
use App\Models\Meta;
use Illuminate\Support\Facades\File;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Read pr_ids from the API CSV file using more robust parsing
        $csvPath = database_path('data/f15proposals.csv');
        $apiPrIds = [];
        
        if (File::exists($csvPath)) {
            $handle = fopen($csvPath, 'r');
            $header = fgetcsv($handle); // Get header row
            $prIdIndex = array_search('pr_id', $header);
            
            if ($prIdIndex !== false) {
                while (($row = fgetcsv($handle)) !== false) {
                    if (isset($row[$prIdIndex]) && !empty(trim($row[$prIdIndex]))) {
                        $apiPrIds[] = trim($row[$prIdIndex]);
                    }
                }
            }
            fclose($handle);
        }
        
        // Remove duplicates and ensure we have exactly 724 pr_ids
        $apiPrIds = array_unique($apiPrIds);
        
        // Validation: ensure we have exactly 724 pr_ids
        if (count($apiPrIds) !== 724) {
            throw new \Exception("Expected 724 pr_ids from CSV, but got " . count($apiPrIds));
        }
        
        // Fund 15 ID
        $fund15Id = '019a9c61-7d7a-7277-b082-bd4137a5a936';
        
        // Find Fund 15 proposals whose catalyst_document_id is NOT in the API
        $proposalsToDelete = Proposal::where('fund_id', $fund15Id)
            ->whereHas('metas', function ($query) use ($apiPrIds) {
                $query->where('key', 'catalyst_document_id')
                    ->whereNotIn('content', $apiPrIds);
            })
            ->get();
        
        // Count how many CSV pr_ids actually exist in the database
        $existingCsvProposals = Proposal::where('fund_id', $fund15Id)
            ->whereHas('metas', function ($query) use ($apiPrIds) {
                $query->where('key', 'catalyst_document_id')
                    ->whereIn('content', $apiPrIds);
            })
            ->count();
            
        $expectedToDelete = 788 - $existingCsvProposals;
        
        // Validation: ensure we're deleting the correct number of proposals
        if ($proposalsToDelete->count() !== $expectedToDelete) {
            throw new \Exception("Expected to delete {$expectedToDelete} proposals (788 total - {$existingCsvProposals} existing CSV pr_ids), but found " . $proposalsToDelete->count() . " to delete");
        }
        
        // Soft delete these proposals
        $deletedCount = 0;
        foreach ($proposalsToDelete as $proposal) {
            $proposal->delete(); // This will soft delete due to SoftDeletes trait
            $deletedCount++;
        }
        
        // Log the action (since we can't use command output in migrations)
        \Illuminate\Support\Facades\Log::info("Migration: Soft deleted {$deletedCount} Fund 15 proposals not in API");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Restore the soft deleted Fund 15 proposals
        $fund15Id = '019a9c61-7d7a-7277-b082-bd4137a5a936';
        
        $restoredCount = Proposal::onlyTrashed()
            ->where('fund_id', $fund15Id)
            ->restore();
        
        \Illuminate\Support\Facades\Log::info("Migration rollback: Restored {$restoredCount} soft deleted Fund 15 proposals");
    }
};
