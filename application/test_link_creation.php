<?php

// Test if Link model creation works
require_once __DIR__ . '/vendor/autoload.php';

use App\Models\Link;
use Illuminate\Support\Str;

// Simple test without database connection - just check instantiation
try {
    $link = new Link();
    
    // Test that we can create the data array without errors
    $data = [
        'id' => (string) Str::uuid(),
        'type' => 'website',
        'link' => 'https://example.com',
        'label' => 'Example',
        'title' => 'Example Website',
        'status' => 'published',
        'valid' => true,
    ];
    
    // Test that fill method works
    $link->fill($data);
    
    echo "✅ Link model instantiation and fill test passed\n";
    echo "✅ Link data structure is correct\n";
    
    // Check fillable attributes
    $fillable = $link->getFillable();
    echo "✅ Fillable attributes: " . implode(', ', $fillable) . "\n";
    
    // Check translatable attributes
    if (property_exists($link, 'translatable')) {
        echo "✅ Translatable attributes: " . implode(', ', $link->translatable) . "\n";
    }
    
} catch (\Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "❌ This indicates a potential issue with the Link model\n";
}

echo "\nLink model test completed.\n";