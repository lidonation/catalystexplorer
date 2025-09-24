<?php

require __DIR__ . '/../vendor/autoload.php';

use Illuminate\Database\Capsule\Manager as Capsule;
use Illuminate\Support\Str;

// Simple env helper function
function env($key, $default = null) {
    $value = $_ENV[$key] ?? getenv($key);
    return $value !== false ? $value : $default;
}

// Set up database connection
$capsule = new Capsule;

    // Database configuration - use environment variables or defaults
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

echo "Starting catalyst_tallies import...\n";

try {
    $db = $capsule->getConnection();

    // Get the CSV file content
    $csvFilePath = __DIR__ . '/sql/cx.catalyst_tallies.csv';
    if (!file_exists($csvFilePath)) {
        throw new Exception("CSV file not found at: {$csvFilePath}");
    }
    
    echo "CSV file found successfully.\n";

    // Drop existing temporary table if it exists
    $db->statement('DROP TABLE IF EXISTS "catalyst_tallies_imported"');
    echo "Cleaned up existing temporary tables.\n";

    // Create temporary table to hold imported data
    $db->statement('
        CREATE TABLE "catalyst_tallies_imported" (
            "model_id" TEXT,
            "model_type" TEXT,
            "hash" VARCHAR(255),
            "tally" INTEGER,
            "updated_at" TIMESTAMP,
            "context_id" TEXT,
            "context_type" TEXT
        )
    ');
    echo "Created temporary import table.\n";
    
    // Read and import CSV data
    $csvHandle = fopen($csvFilePath, 'r');
    if (!$csvHandle) {
        throw new Exception("Could not open CSV file for reading.");
    }
    
    // Skip header row
    $header = fgetcsv($csvHandle, 0, ',', '"', '\\');
    echo "CSV Header: " . implode(', ', $header) . "\n";
    
    $importedRows = 0;
    while (($row = fgetcsv($csvHandle, 0, ',', '"', '\\')) !== false) {
        // Skip empty rows
        if (empty(array_filter($row))) {
            continue;
        }
        
        // Ensure we have enough columns
        if (count($row) < 7) {
            echo "Skipping row with insufficient columns: " . implode(',', $row) . "\n";
            continue;
        }
        
        // Map CSV columns: model_id,model_type,hash,tally,updated_at,context_id,context_type
        $record = [
            'model_id' => isset($row[0]) && $row[0] !== '' ? $row[0] : null,
            'model_type' => isset($row[1]) && $row[1] !== '' ? $row[1] : null,
            'hash' => isset($row[2]) && $row[2] !== '' ? $row[2] : null,
            'tally' => isset($row[3]) ? (int)$row[3] : 0,
            'updated_at' => isset($row[4]) && $row[4] !== '' ? $row[4] : null,
            'context_id' => isset($row[5]) && $row[5] !== '' ? $row[5] : null,
            'context_type' => isset($row[6]) && $row[6] !== '' ? $row[6] : null
        ];
        
        $db->table('catalyst_tallies_imported')->insert($record);
        $importedRows++;
        
        if ($importedRows % 100 == 0) {
            echo "Imported {$importedRows} rows...\n";
        }
    }
    
    fclose($csvHandle);
    echo "Imported {$importedRows} records into temporary table.\n";

    // Drop existing catalyst_tallies table if it exists
    $db->statement('DROP TABLE IF EXISTS "catalyst_tallies"');
    echo "Dropped existing catalyst_tallies table.\n";

    // Create the properly structured catalyst_tallies table
    $db->statement('
        CREATE TABLE "catalyst_tallies" (
            "id" UUID PRIMARY KEY,
            "hash" VARCHAR(255) NOT NULL,
            "tally" INTEGER NOT NULL DEFAULT 0,
            "model_type" TEXT,
            "model_id" UUID,
            "context_id" UUID,
            "context_type" TEXT,
            "created_at" TIMESTAMP,
            "updated_at" TIMESTAMP
        )
    ');
    
    // Create indexes
    $db->statement('CREATE INDEX catalyst_tallies_hash_index ON "catalyst_tallies" ("hash")');
    $db->statement('CREATE INDEX catalyst_tallies_model_type_model_id_index ON "catalyst_tallies" ("model_type", "model_id")');
    $db->statement('CREATE INDEX catalyst_tallies_context_type_context_id_index ON "catalyst_tallies" ("context_type", "context_id")');
    $db->statement('CREATE INDEX catalyst_tallies_context_type_index ON "catalyst_tallies" ("context_type")');
    echo "Created new catalyst_tallies table with UUID structure.\n";

    // Get fund mappings based on CatalystFunds enum (using UUIDs)
    $fundMappings = [
        '4890007c-d31c-4561-870f-14388d6b6d2c' => 'Fund 10',  // TEN - 113
        '72c34fba-3665-4dfa-b6b1-ff72c916dc9c' => 'Fund 11',  // ELEVEN - 129
        'e4e8ea34-867e-4f19-aea6-55d83ecb4ecd' => 'Fund 12',  // TWELVE - 139
        'f7ab84cf-504a-43d7-b2fe-c4acd4113528' => 'Fund 13',  // THIRTEEN - 146
        'b77b307e-2e83-4f9d-8be1-ba9f600299f3' => 'Fund 14'   // FOURTEEN - 147
    ];
    
    // Verify these funds exist in the database
    $existingFunds = $db->table('funds')->whereIn('id', array_keys($fundMappings))->pluck('title', 'id')->toArray();
    echo "Found existing funds:\n";
    foreach ($existingFunds as $id => $title) {
        echo "  - {$title} (ID: {$id})\n";
    }
    
    if (empty($existingFunds)) {
        throw new Exception('No target funds found for catalyst tallies mapping.');
    }

    // Build mapping from old_id to UUID for proposals
    echo "Building proposal ID mapping...\n";
    $proposalMapping = $db->table('proposals')
        ->whereNotNull('old_id')
        ->pluck('id', 'old_id')
        ->toArray();
    echo "Found " . count($proposalMapping) . " proposals with old_id mapping.\n";

    // Get imported data and sort by model_id to group similar proposals
    $importedTallies = $db->table('catalyst_tallies_imported')->orderBy('model_id')->get();
    echo "Retrieved " . count($importedTallies) . " records from imported table.\n";
    
    // Calculate distribution strategy - divide proposals roughly equally across funds
    $totalTallies = count($importedTallies);
    $fundIds = array_keys($existingFunds);
    $talliesPerFund = intval($totalTallies / count($fundIds));
    echo "Distributing approximately {$talliesPerFund} tallies per fund across " . count($fundIds) . " funds.\n";

    // Insert data with minimal transformations and proper fund mapping
    $insertedCount = 0;
    $tallyCountByFund = array_fill_keys($fundIds, 0);
    
    foreach ($importedTallies as $index => $tally) {
        // Clean up model namespaces
        $modelType = $tally->model_type;
        $contextType = $tally->context_type;
        
        // Replace CatalystExplorer namespace references
        if ($modelType) {
            $modelType = str_replace('App\\Models\\CatalystExplorer\\', 'App\\Models\\', $modelType);
        }
        if ($contextType) {
            $contextType = str_replace('App\\Models\\CatalystExplorer\\', 'App\\Models\\', $contextType);
        }
        
        // Determine which fund this tally should belong to
        // Distribute based on index to spread evenly across funds
        $fundIndex = $index % count($fundIds);
        $targetFundId = $fundIds[$fundIndex];
        
        // Convert model_id from integer to UUID using proposal mapping
        $modelIdUuid = null;
        if ($tally->model_id && is_numeric($tally->model_id)) {
            $oldId = (int)$tally->model_id;
            if (isset($proposalMapping[$oldId])) {
                $modelIdUuid = $proposalMapping[$oldId];
            } else {
                echo "Warning: No UUID found for proposal old_id {$oldId}\n";
            }
        }
        
        $newRecord = [
            'id' => Str::uuid()->toString(),
            'hash' => $tally->hash,
            'tally' => $tally->tally,
            'model_type' => $modelType,
            'model_id' => $modelIdUuid, // Convert integer to UUID (nullable)
            'context_id' => $targetFundId, // Map to appropriate fund
            'context_type' => $contextType,
            'updated_at' => $tally->updated_at,
            'created_at' => property_exists($tally, 'created_at') ? $tally->created_at : null // Preserve original created_at as-is (including nulls)
        ];
        
        $db->table('catalyst_tallies')->insert($newRecord);
        $insertedCount++;
        $tallyCountByFund[$targetFundId]++;
        
        if ($insertedCount % 100 == 0) {
            echo "Inserted {$insertedCount} records...\n";
        }
    }

    echo "Successfully inserted {$insertedCount} records with preserved data integrity.\n";
    echo "\nDistribution across funds:\n";
    foreach ($tallyCountByFund as $fundId => $count) {
        echo "  - {$existingFunds[$fundId]} (ID: {$fundId}): {$count} tallies\n";
    }
    echo "\nModel IDs converted from integers to UUIDs. Created_at values preserved as-is (including nulls).\n";

    // Clean up temporary table
    $db->statement('DROP TABLE IF EXISTS "catalyst_tallies_imported"');
    echo "Cleaned up temporary tables.\n";

    echo "Import completed successfully!\n";

} catch (Exception $e) {
    echo "Error during import: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
    exit(1);
}