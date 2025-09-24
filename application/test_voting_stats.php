<?php

require_once __DIR__ . '/application/vendor/autoload.php';

use Illuminate\Foundation\Application;

$app = new Application(realpath(__DIR__ . '/application'));

$app->singleton(
    Illuminate\Contracts\Http\Kernel::class,
    App\Http\Kernel::class
);

$app->singleton(
    Illuminate\Contracts\Console\Kernel::class,
    App\Console\Kernel::class
);

$app->singleton(
    Illuminate\Contracts\Debug\ExceptionHandler::class,
    App\Exceptions\Handler::class
);

$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

echo "Testing VotingStats functionality...\n";

try {
    // Test basic CatalystTally functionality
    $totalRecords = App\Models\CatalystTally::count();
    $totalVotes = App\Models\CatalystTally::sum('tally');
    
    echo "Total CatalystTally records: $totalRecords\n";
    echo "Total votes: $totalVotes\n";
    
    // Test getting sample data
    $sampleTallies = App\Models\CatalystTally::orderBy('tally', 'desc')->limit(3)->get();
    echo "\nTop 3 tallies:\n";
    foreach ($sampleTallies as $tally) {
        echo "  ID: {$tally->id}, Votes: {$tally->tally}, Model ID: {$tally->model_id}\n";
    }
    
    echo "\nTest completed successfully!\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
}