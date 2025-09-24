<?php

require __DIR__ . '/../vendor/autoload.php';

use Illuminate\Database\Capsule\Manager as Capsule;

// Set up database connection
$capsule = new Capsule;

// Database configuration - try localhost first, fall back to Docker hostname
$host = 'localhost'; // Change this to 'catalystexplorer.db' if running in Docker

$capsule->addConnection([
    'driver' => 'pgsql',
    'host' => $host,
    'port' => '5432',
    'database' => 'explorerweb',
    'username' => 'catalystexplorer',
    'password' => 'ASLJ023470AlserLFH',
    'charset' => 'utf8',
    'prefix' => '',
]);

$capsule->setAsGlobal();
$capsule->bootEloquent();

echo "Starting catalyst_tallies rollback...\n";

try {
    $db = $capsule->getConnection();
    
    // Drop the catalyst_tallies table
    echo "Dropping catalyst_tallies table...\n";
    $db->statement('DROP TABLE IF EXISTS "catalyst_tallies" CASCADE');
    
    // Remove migration entries from migrations table
    echo "Removing migration entries from migrations table...\n";
    $db->table('migrations')
        ->where('migration', 'like', '%catalyst_tallies%')
        ->delete();
    
    echo "Rollback completed successfully!\n";
    echo "Removed:\n";
    echo "- catalyst_tallies table\n";
    echo "- Related migration entries\n";

} catch (Exception $e) {
    echo "Error during rollback: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
    exit(1);
}