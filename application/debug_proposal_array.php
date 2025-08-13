<?php

use App\Models\Proposal;

require_once __DIR__.'/vendor/autoload.php';

// Bootstrap Laravel
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Debugging proposal toArray()...\n\n";

try {
    $slug = 'decentralised-funding - report-f2';
    
    $proposal = Proposal::where('slug', $slug)->firstOrFail();
    
    echo "Found proposal with ID: " . $proposal->id . "\n\n";
    
    $array = $proposal->toArray();
    
    echo "Keys in proposal toArray():\n";
    foreach (array_keys($array) as $key) {
        echo "- $key\n";
    }
    
    echo "\nID present: " . (array_key_exists('id', $array) ? 'YES' : 'NO') . "\n";
    
    if (array_key_exists('id', $array)) {
        echo "ID value: " . $array['id'] . "\n";
    }
    
    echo "\nChecking for uuid in array...\n";
    echo "UUID present: " . (array_key_exists('uuid', $array) ? 'YES' : 'NO') . "\n";
    
    if (array_key_exists('uuid', $array)) {
        echo "UUID value: " . $array['uuid'] . "\n";
    }
    
    echo "\nDirect property access:\n";
    echo "\$proposal->id: " . $proposal->id . "\n";
    echo "\$proposal->uuid: " . $proposal->uuid . "\n";
    echo "\$proposal->getKey(): " . $proposal->getKey() . "\n";
    
} catch (\Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "\n";
}

echo "\nDebugging completed.\n";
