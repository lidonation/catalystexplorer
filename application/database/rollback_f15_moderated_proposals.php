<?php

require __DIR__ . '/../vendor/autoload.php';

use Illuminate\Database\Capsule\Manager as Capsule;
use App\Models\Proposal;

// Simple env helper function
function env($key, $default = null) {
    $value = $_ENV[$key] ?? getenv($key);
    return $value !== false ? $value : $default;
}

// Set up database connection
$capsule = new Capsule;

$capsule->addConnection([
    'driver' => 'pgsql',
    'host' => env('DB_HOST', 'catalystexplorer.db'),
    'port' => env('DB_PORT', '5432'),
    'database' => env('DB_DATABASE', 'explorerweb'),
    'username' => env('DB_USERNAME', 'catalystexplorer'),
    'password' => env('DB_PASSWORD', 'ASLJ023470AlserLFH'),
    'charset' => 'utf8',
    'prefix' => '',
]);

$capsule->setAsGlobal();
$capsule->bootEloquent();

echo "Starting F15 moderated proposals rollback...\n";

try {
    $db = $capsule->getConnection();
    
    // Get the CSV file content
    $csvFilePath = __DIR__ . '/sql/f15-moderated-proposals.csv';
    if (!file_exists($csvFilePath)) {
        throw new Exception("CSV file not found at: {$csvFilePath}");
    }
    
    echo "CSV file found successfully.\n";
    
    // Start transaction
    $db->beginTransaction();
    echo "Transaction started.\n";
    
    // Read CSV file
    $csvHandle = fopen($csvFilePath, 'r');
    if (!$csvHandle) {
        throw new Exception("Could not open CSV file for reading.");
    }
    
    // Skip header row
    $header = fgetcsv($csvHandle, 0, ',', '"', '\\');
    echo "CSV Header: " . implode(', ', $header) . "\n";
    
    // Map headers to indices
    $headerMap = array_flip($header);
    
    $processedRows = 0;
    $restoredCount = 0;
    $notFoundCount = 0;
    $notDeletedCount = 0;
    
    echo "\nRestoring proposals...\n";
    echo str_repeat('-', 80) . "\n";
    
    while (($row = fgetcsv($csvHandle, 0, ',', '"', '\\')) !== false) {
        // Skip empty rows
        if (empty(array_filter($row))) {
            continue;
        }
        
        $processedRows++;
        
        // Extract data from CSV
        $proposalId = $row[$headerMap['proposal_id']] ?? null;
        $title = $row[$headerMap['title']] ?? 'Unknown';
        
        if (!$proposalId) {
            echo "Row {$processedRows}: Skipping - No proposal_id\n";
            continue;
        }
        
        // Find proposal by matching catalyst_document_id in metas
        // Use withTrashed equivalent - select even soft deleted
        $proposal = $db->table('proposals')
            ->select('proposals.id', 'proposals.title', 'proposals.deleted_at')
            ->join('metas', function($join) {
                $join->on('metas.model_id', '=', 'proposals.id')
                     ->where('metas.model_type', '=', 'App\\Models\\Proposal')
                     ->where('metas.key', '=', 'catalyst_document_id');
            })
            ->where('metas.content', '=', $proposalId)
            ->first();
        
        if (!$proposal) {
            echo "Row {$processedRows}: NOT FOUND - {$title} (catalyst_document_id: {$proposalId})\n";
            $notFoundCount++;
            continue;
        }
        
        // Check if not soft deleted
        if ($proposal->deleted_at === null) {
            echo "Row {$processedRows}: NOT DELETED - {$title}\n";
            $notDeletedCount++;
            continue;
        }
        
        // Remove moderated_reason meta
        $db->table('metas')
            ->where('model_id', '=', $proposal->id)
            ->where('model_type', '=', 'App\\Models\\Proposal')
            ->where('key', '=', 'moderated_reason')
            ->delete();
        
        // Note: We keep catalyst_app_url as it might be useful
        
        // Restore the proposal (remove soft delete)
        $db->table('proposals')
            ->where('id', $proposal->id)
            ->update([
                'deleted_at' => null,
                'updated_at' => now(),
            ]);
        
        // Add back to search index using Eloquent model
        try {
            $eloquentProposal = Proposal::find($proposal->id);
            if ($eloquentProposal) {
                $eloquentProposal->searchable();
            }
        } catch (\Exception $e) {
            echo "Warning: Failed to add back to search index: {$e->getMessage()}\n";
        }
        
        $restoredCount++;
        echo "Row {$processedRows}: RESTORED - {$title}\n";
        
        if ($processedRows % 10 == 0) {
            echo "\nProgress: {$processedRows} rows processed, {$restoredCount} restored\n";
            echo str_repeat('-', 80) . "\n";
        }
    }
    
    fclose($csvHandle);
    
    echo "\n" . str_repeat('=', 80) . "\n";
    echo "Summary:\n";
    echo str_repeat('=', 80) . "\n";
    echo "Total rows processed:    {$processedRows}\n";
    echo "Proposals restored:      {$restoredCount}\n";
    echo "Proposals not found:     {$notFoundCount}\n";
    echo "Not deleted:             {$notDeletedCount}\n";
    echo str_repeat('=', 80) . "\n";
    
    // Commit transaction
    $db->commit();
    echo "\nTransaction committed successfully!\n";
    
    echo "\n✅ F15 moderated proposals rollback completed successfully.\n";
    
} catch (Exception $e) {
    // Rollback on error
    if (isset($db)) {
        $db->rollBack();
        echo "\n❌ Transaction rolled back due to error.\n";
    }
    echo "\n❌ Error: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
    exit(1);
}
