<?php

require __DIR__ . '/../vendor/autoload.php';

use Illuminate\Database\Capsule\Manager as Capsule;
use Illuminate\Support\Str;
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

echo "Starting F15 moderated proposals soft deletion...\n";

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
    $softDeletedCount = 0;
    $notFoundCount = 0;
    $alreadyDeletedCount = 0;

    echo "\nProcessing proposals...\n";
    echo str_repeat('-', 80) . "\n";

    while (($row = fgetcsv($csvHandle, 0, ',', '"', '\\')) !== false) {
        if (empty(array_filter($row))) {
            continue;
        }

        $processedRows++;

        $proposalId = $row[$headerMap['proposal_id']] ?? null;
        $moderatedReason = $row[$headerMap['moderated_reason']] ?? null;
        $catalystAppUrl = $row[$headerMap['catalyst_app_url']] ?? null;
        $title = $row[$headerMap['title']] ?? 'Unknown';
        $fundsRequested = $row[$headerMap['amount_requested']] ?? null;

        if (!$proposalId) {
            echo "Row {$processedRows}: Skipping - No proposal_id\n";
            continue;
        }

        $proposal = $db->table('proposals')
            ->select('proposals.id', 'proposals.title', 'proposals.deleted_at')
            ->join('metas', function($join) {
                $join->on('metas.model_id', '=', 'proposals.id')
                     ->where('metas.model_type', '=', 'App\\Models\\Proposal')
                     ->where('metas.key', '=', 'catalyst_document_id');
            })
            ->where('metas.content', '=', $proposalId)
            ->first();

        if (!$proposal && $fundsRequested) {
            $budgetAmount = null;
            $cleanAmount = preg_replace('/[^\d,]/', '', $fundsRequested);
            $cleanAmount = str_replace(',', '', $cleanAmount);

            if (!empty($cleanAmount) && is_numeric($cleanAmount)) {
                $budgetAmount = (int) $cleanAmount;
            }

            if ($budgetAmount) {
                $proposal = $db->table('proposals')
                    ->select('id', 'title', 'deleted_at')
                    ->whereRaw("CAST(title AS TEXT) = ?", [$title])
                    ->where('amount_requested', $budgetAmount)
                    ->first();

                if ($proposal) {
                    echo "Row {$processedRows}: FOUND BY TITLE+BUDGET - {$title} (amount: {$budgetAmount})\n";
                } else {
                    // Debug output to help identify the issue
                    echo "Row {$processedRows}: NOT FOUND BY TITLE+BUDGET - {$title} (parsed amount: {$budgetAmount} from '{$fundsRequested}')\n";
                }
            } else {
                echo "Row {$processedRows}: Could not parse amount from '{$fundsRequested}'\n";
            }
        }

        if (!$proposal) {
            echo "Row {$processedRows}: NOT FOUND - {$title} (catalyst_document_id: {$proposalId})\n";
            $notFoundCount++;
            continue;
        }

        if ($proposal->deleted_at !== null) {
            echo "Row {$processedRows}: ALREADY DELETED - {$title}\n";
            $alreadyDeletedCount++;
            continue;
        }

        if ($moderatedReason && trim($moderatedReason) !== '') {
            $existingMeta = $db->table('metas')
                ->where('model_id', '=', $proposal->id)
                ->where('model_type', '=', 'App\\Models\\Proposal')
                ->where('key', '=', 'f')
                ->first();

            if ($existingMeta) {
                // Update existing meta
                $db->table('metas')
                    ->where('id', $existingMeta->id)
                    ->update([
                        'content' => $moderatedReason,
                        'updated_at' => now(),
                    ]);
            } else {
                $db->table('metas')->insert([
                    'id' => Str::uuid()->toString(),
                    'model_id' => $proposal->id,
                    'model_type' => 'App\\Models\\Proposal',
                    'key' => 'moderated_reason',
                    'content' => $moderatedReason,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        if ($catalystAppUrl && trim($catalystAppUrl) !== '') {
            $existingUrl = $db->table('metas')
                ->where('model_id', '=', $proposal->id)
                ->where('model_type', '=', 'App\\Models\\Proposal')
                ->where('key', '=', 'catalyst_app_url')
                ->first();

            if ($existingUrl) {
                // Update existing meta
                $db->table('metas')
                    ->where('id', $existingUrl->id)
                    ->update([
                        'content' => $catalystAppUrl,
                        'updated_at' => now(),
                    ]);
            } else {
                // Insert new meta
                $db->table('metas')->insert([
                    'id' => Str::uuid()->toString(),
                    'model_id' => $proposal->id,
                    'model_type' => 'App\\Models\\Proposal',
                    'key' => 'catalyst_app_url',
                    'content' => $catalystAppUrl,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        $db->table('proposals')
            ->where('id', $proposal->id)
            ->update([
                'deleted_at' => now(),
                'updated_at' => now(),
            ]);

        try {
            $proposalModel = new Proposal();
            $proposalModel->id = $proposal->id;
            $proposalModel->exists = true;

            if (method_exists($proposalModel, 'unsearchable')) {
                $proposalModel->unsearchable();
            }
        } catch (\Exception $e) {
            echo "Warning: Failed to remove from search index: {$e->getMessage()}\n";
        }

        $softDeletedCount++;
        echo "Row {$processedRows}: SOFT DELETED - {$title} (Reason: {$moderatedReason})\n";

        if ($processedRows % 10 == 0) {
            echo "\nProgress: {$processedRows} rows processed, {$softDeletedCount} soft deleted\n";
            echo str_repeat('-', 80) . "\n";
        }
    }

    fclose($csvHandle);

    echo "\n" . str_repeat('=', 80) . "\n";
    echo "Summary:\n";
    echo str_repeat('=', 80) . "\n";
    echo "Total rows processed:    {$processedRows}\n";
    echo "Proposals soft deleted:  {$softDeletedCount}\n";
    echo "Proposals not found:     {$notFoundCount}\n";
    echo "Already deleted:         {$alreadyDeletedCount}\n";
    echo str_repeat('=', 80) . "\n";

    // Commit transaction
    $db->commit();
    echo "\nTransaction committed successfully!\n";

    echo "\n✅ F15 moderated proposals soft deletion completed successfully.\n";

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
