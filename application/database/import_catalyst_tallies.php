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

    // Get the SQL file content
    $sqlFilePath = __DIR__ . '/sql/catalyst_tallies.sql';
    if (!file_exists($sqlFilePath)) {
        throw new Exception("SQL file not found at: {$sqlFilePath}");
    }
    
    $sqlContent = file_get_contents($sqlFilePath);
    echo "SQL file loaded successfully.\n";

    // Drop existing temporary table if it exists
    $db->statement('DROP TABLE IF EXISTS "catalyst_tallies_imported"');
    $db->statement('DROP SEQUENCE IF EXISTS catalyst_tallies_imported_id_seq');
    echo "Cleaned up existing temporary tables.\n";

    // Modify the SQL content to use temporary table name
    $sqlContent = str_replace('"public"."catalyst_tallies"', '"catalyst_tallies_imported"', $sqlContent);
    $sqlContent = str_replace('catalyst_tallies_id_seq', 'catalyst_tallies_imported_id_seq', $sqlContent);
    $sqlContent = str_replace('catalyst_tallies_context_type_context_id_index', 'catalyst_tallies_imported_context_type_context_id_index', $sqlContent);
    $sqlContent = str_replace('catalyst_tallies_context_type_index', 'catalyst_tallies_imported_context_type_index', $sqlContent);
    $sqlContent = str_replace('catalyst_tallies_model_type_index', 'catalyst_tallies_imported_model_type_index', $sqlContent);
    
    // Fix index creation statements to reference the correct imported table
    $sqlContent = str_replace('ON public.catalyst_tallies USING', 'ON catalyst_tallies_imported USING', $sqlContent);

    // Execute the modified SQL content to create the temporary imported table
    $db->unprepared($sqlContent);
    echo "Imported data into temporary table.\n";

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
            "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            "updated_at" TIMESTAMP
        )
    ');
    
    // Create indexes
    $db->statement('CREATE INDEX catalyst_tallies_hash_index ON "catalyst_tallies" ("hash")');
    $db->statement('CREATE INDEX catalyst_tallies_model_type_model_id_index ON "catalyst_tallies" ("model_type", "model_id")');
    $db->statement('CREATE INDEX catalyst_tallies_context_type_context_id_index ON "catalyst_tallies" ("context_type", "context_id")');
    $db->statement('CREATE INDEX catalyst_tallies_context_type_index ON "catalyst_tallies" ("context_type")');
    echo "Created new catalyst_tallies table with UUID structure.\n";

    // Get imported data
    $importedTallies = $db->table('catalyst_tallies_imported')->get();
    echo "Retrieved " . count($importedTallies) . " records from imported table.\n";

    // Insert data with UUID transformations
    $insertedCount = 0;
    foreach ($importedTallies as $tally) {
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
        
        $newRecord = [
            'id' => Str::uuid()->toString(),
            'hash' => $tally->hash,
            'tally' => $tally->tally,
            'model_type' => $modelType,
            'model_id' => is_numeric($tally->model_id) ? Str::uuid()->toString() : $tally->model_id,
            'context_id' => is_numeric($tally->context_id) ? Str::uuid()->toString() : $tally->context_id,
            'context_type' => $contextType,
            'updated_at' => $tally->updated_at,
            'created_at' => now()
        ];
        
        $db->table('catalyst_tallies')->insert($newRecord);
        $insertedCount++;
        
        if ($insertedCount % 100 == 0) {
            echo "Inserted {$insertedCount} records...\n";
        }
    }

    echo "Successfully inserted {$insertedCount} records.\n";

    // Clean up temporary table
    $db->statement('DROP TABLE IF EXISTS "catalyst_tallies_imported"');
    $db->statement('DROP SEQUENCE IF EXISTS catalyst_tallies_imported_id_seq');
    echo "Cleaned up temporary tables.\n";

    echo "Import completed successfully!\n";

} catch (Exception $e) {
    echo "Error during import: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
    exit(1);
}