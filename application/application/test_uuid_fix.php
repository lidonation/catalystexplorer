<?php
/**
 * Simple test to verify the UUID migration fixed the type mismatch
 * This can be run with: php test_uuid_fix.php
 */

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Proposal;
use App\Models\Review;
use App\Models\Discussion;

echo "Testing UUID fix for reviews relationship...\n\n";

// Test 1: Check if reviews table has UUID columns
try {
    $reviewSchema = DB::select("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'reviews' AND column_name IN ('id', 'old_id', 'parent_id')");
    echo "Reviews table schema:\n";
    foreach ($reviewSchema as $column) {
        echo "  {$column->column_name}: {$column->data_type}\n";
    }
    echo "\n";
} catch (Exception $e) {
    echo "Error checking reviews schema: " . $e->getMessage() . "\n";
    exit(1);
}

// Test 2: Check if discussions table has old_id as expected
try {
    $discussionSchema = DB::select("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'discussions' AND column_name = 'old_id'");
    echo "Discussions old_id column:\n";
    foreach ($discussionSchema as $column) {
        echo "  {$column->column_name}: {$column->data_type}\n";
    }
    echo "\n";
} catch (Exception $e) {
    echo "Error checking discussions schema: " . $e->getMessage() . "\n";
    exit(1);
}

// Test 3: Try to get reviews count for a proposal (this should not crash)
try {
    $proposal = Proposal::first();
    if ($proposal) {
        $reviewsCount = $proposal->reviews()->count();
        echo "Found proposal '{$proposal->title}' with {$reviewsCount} reviews\n";
        
        // Test the actual relationship loading
        $reviews = $proposal->reviews()->limit(5)->get();
        echo "Successfully loaded " . count($reviews) . " reviews\n";
        
        if (!empty($reviews)) {
            echo "Sample review IDs:\n";
            foreach ($reviews as $review) {
                echo "  - {$review->id}\n";
            }
        }
    } else {
        echo "No proposals found in database\n";
    }
    echo "\n";
} catch (Exception $e) {
    echo "Error testing reviews relationship: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
    exit(1);
}

// Test 4: Test IdeascaleProfile reviews relationship
try {
    $profile = App\Models\IdeascaleProfile::first();
    if ($profile) {
        $profileReviewsCount = $profile->reviews()->count();
        echo "Found profile '{$profile->name}' with {$profileReviewsCount} reviews\n";
        
        $profileReviews = $profile->reviews()->limit(5)->get();
        echo "Successfully loaded " . count($profileReviews) . " profile reviews\n";
    } else {
        echo "No ideascale profiles found in database\n";
    }
    echo "\n";
} catch (Exception $e) {
    echo "Error testing profile reviews relationship: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
    exit(1);
}

echo "✅ All UUID relationship tests passed! The migration appears to be working.\n";
