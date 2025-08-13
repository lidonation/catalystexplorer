<?php
/**
 * Test the ProposalsController directly
 */

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Http\Controllers\ProposalsController;
use Illuminate\Http\Request;

echo "Testing ProposalsController directly...\n\n";

try {
    $slug = 'decentralised-funding - report-f2';
    
    // Create a fake request
    $request = Request::create("/en/proposals/{$slug}/details", 'GET');
    $request->server->set('REQUEST_URI', "/en/proposals/{$slug}/details");
    $request->server->set('PATH_INFO', "/en/proposals/{$slug}/details");
    
    // Create controller instance
    $controller = new ProposalsController();
    
    echo "Calling controller->proposal() method...\n";
    
    $response = $controller->proposal($request, $slug);
    
    echo "✅ Controller method executed successfully\n";
    echo "Response type: " . get_class($response) . "\n";
    
} catch (Exception $e) {
    echo "❌ Error in controller: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . " Line: " . $e->getLine() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
}

echo "\n";
