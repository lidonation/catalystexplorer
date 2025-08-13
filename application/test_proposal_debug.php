<?php
/**
 * Debug the specific proposal that's failing
 */

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Proposal;

echo "Testing specific proposal: 'decentralised-funding - report-f2'\n\n";

try {
    // Test exact slug
    $slug = 'decentralised-funding - report-f2';
    echo "Looking for proposal with slug: '{$slug}'\n";
    
    $proposal = Proposal::where('slug', $slug)->first();
    if ($proposal) {
        echo "✅ Found proposal: {$proposal->title}\n";
        echo "   ID: {$proposal->id}\n";
        echo "   Slug: {$proposal->slug}\n";
        
        // Test reviews
        try {
            echo "\nTesting reviews attribute...\n";
            $reviews = $proposal->reviews;
            echo "✅ Reviews loaded successfully: " . count($reviews) . " reviews\n";
            
            if (count($reviews) > 0) {
                echo "Sample review ID: {$reviews->first()->id}\n";
            }
        } catch (Exception $e) {
            echo "❌ Error loading reviews: " . $e->getMessage() . "\n";
        }
        
    } else {
        echo "❌ No proposal found with exact slug\n";
        
        // Try variations
        $variations = [
            'decentralised-funding---report-f2',
            'decentralised-funding%20-%20report-f2',
            'decentralised-funding-report-f2',
        ];
        
        echo "\nTrying variations:\n";
        foreach ($variations as $variation) {
            $alt = Proposal::where('slug', $variation)->first();
            if ($alt) {
                echo "✅ Found with variation '{$variation}': {$alt->title}\n";
                break;
            } else {
                echo "❌ No match for: {$variation}\n";
            }
        }
        
        // Search for similar titles
        echo "\nSearching for similar titles...\n";
        $similar = Proposal::where('title', 'LIKE', '%decentralised%funding%')
                          ->orWhere('title', 'LIKE', '%report-f2%')
                          ->get(['slug', 'title']);
        
        if ($similar->count() > 0) {
            echo "Found similar proposals:\n";
            foreach ($similar as $s) {
                echo "  - Slug: {$s->slug}\n    Title: {$s->title}\n";
            }
        } else {
            echo "No similar proposals found\n";
        }
    }
    
} catch (Exception $e) {
    echo "❌ Database error: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
}

echo "\n";
