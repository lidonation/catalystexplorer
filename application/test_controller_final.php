<?php

use App\Http\Controllers\ProposalsController;
use App\Models\Proposal;
use Illuminate\Http\Request;

require_once __DIR__.'/vendor/autoload.php';

// Bootstrap Laravel
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Testing ProposalsController with UUID fixes...\n\n";

try {
    $slug = 'decentralised-funding - report-f2';
    
    // Create a mock request
    $request = Request::create('/test', 'GET');
    
    // Instantiate the controller
    $controller = new ProposalsController();
    
    echo "Testing proposal method for slug: '$slug'\n";
    
    // Call the proposal method directly
    $response = $controller->proposal($request, $slug);
    
    if ($response) {
        echo "✓ Controller method executed successfully!\n";
        echo "Response type: " . get_class($response) . "\n";
        
        // Get response data if it's an Inertia response
        if (method_exists($response, 'toResponse')) {
            $httpResponse = $response->toResponse($request);
            echo "HTTP Status: " . $httpResponse->getStatusCode() . "\n";
        }
        
        echo "✓ No UUID/bigint type mismatch errors!\n";
    } else {
        echo "✗ Controller method returned null/false\n";
    }
    
} catch (\Exception $e) {
    echo "✗ Error testing controller: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . "\n";
    echo "Line: " . $e->getLine() . "\n";
    echo "\nStack trace:\n" . $e->getTraceAsString() . "\n";
}

echo "\nTesting completed.\n";
