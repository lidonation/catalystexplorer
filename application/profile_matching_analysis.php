<?php

/**
 * Profile Matching Analysis Script
 * 
 * This script analyzes the database to find potential connections between 
 * ideascale_profiles and catalyst_profiles based on:
 * - Username matches
 * - Email prefix matches  
 * - Catalyst ID extraction matches
 * - Name similarity matches
 */

require 'bootstrap/app.php';
$app = app();

echo "=== PROFILE MATCHING ANALYSIS ===\n\n";

// Get all ideascale profiles with useful data
$ideascaleProfiles = App\Models\IdeascaleProfile::select('id', 'name', 'username', 'email')
    ->whereNotNull('username')
    ->orWhereNotNull('email')
    ->get();

// Get all catalyst profiles  
$catalystProfiles = App\Models\CatalystProfile::select('id', 'name', 'username', 'catalyst_id')
    ->whereNotNull('username')
    ->orWhereNotNull('catalyst_id')
    ->get();

echo "Total IdeaScale profiles to analyze: " . $ideascaleProfiles->count() . "\n";
echo "Total Catalyst profiles to analyze: " . $catalystProfiles->count() . "\n\n";

$matches = [];
$totalMatches = 0;

// Helper function to extract username from catalyst_id
function extractUsernameFromCatalystId($catalystId) {
    if (empty($catalystId) || strpos($catalystId, 'id.catalyst://') !== 0) {
        return null;
    }
    
    // Remove 'id.catalyst://' prefix
    $afterProtocol = substr($catalystId, 14);
    
    // Get part before '@cardano/'
    $beforeCardano = explode('@cardano/', $afterProtocol)[0];
    
    // URL decode
    $decoded = urldecode($beforeCardano);
    
    return strtolower(trim($decoded));
}

// Helper function to get searchable identifiers from ideascale profile
function getIdeascaleIdentifiers($profile) {
    $identifiers = [];
    
    if (!empty($profile->username)) {
        $identifiers[] = strtolower(trim($profile->username));
    }
    
    if (!empty($profile->email)) {
        $emailPart = explode('@', $profile->email)[0];
        if (!empty($emailPart)) {
            $identifiers[] = strtolower(trim($emailPart));
        }
    }
    
    return array_unique($identifiers);
}

// Helper function to get searchable identifiers from catalyst profile
function getCatalystIdentifiers($profile) {
    $identifiers = [];
    
    if (!empty($profile->username)) {
        $identifiers[] = strtolower(trim($profile->username));
    }
    
    $extractedFromId = extractUsernameFromCatalystId($profile->catalyst_id);
    if (!empty($extractedFromId)) {
        $identifiers[] = $extractedFromId;
    }
    
    return array_unique($identifiers);
}

// 1. EXACT IDENTIFIER MATCHES
echo "1. SEARCHING FOR EXACT IDENTIFIER MATCHES...\n";
foreach ($ideascaleProfiles as $ideascale) {
    $ideascaleIds = getIdeascaleIdentifiers($ideascale);
    
    foreach ($catalystProfiles as $catalyst) {
        $catalystIds = getCatalystIdentifiers($catalyst);
        
        $commonIds = array_intersect($ideascaleIds, $catalystIds);
        
        if (!empty($commonIds)) {
            $match = [
                'type' => 'EXACT_IDENTIFIER_MATCH',
                'confidence' => 'HIGH',
                'matched_on' => implode(', ', $commonIds),
                'ideascale' => [
                    'id' => $ideascale->id,
                    'name' => $ideascale->name,
                    'username' => $ideascale->username,
                    'email' => $ideascale->email,
                ],
                'catalyst' => [
                    'id' => $catalyst->id, 
                    'name' => $catalyst->name,
                    'username' => $catalyst->username,
                    'catalyst_id' => $catalyst->catalyst_id,
                    'extracted_username' => extractUsernameFromCatalystId($catalyst->catalyst_id),
                ]
            ];
            
            $matches[] = $match;
            $totalMatches++;
        }
    }
}

echo "   Found " . count(array_filter($matches, fn($m) => $m['type'] === 'EXACT_IDENTIFIER_MATCH')) . " exact identifier matches\n\n";

// 2. NAME SIMILARITY MATCHES (only for profiles not already matched)
echo "2. SEARCHING FOR NAME SIMILARITY MATCHES...\n";
$alreadyMatchedIdeascale = array_column(array_column($matches, 'ideascale'), 'id');
$alreadyMatchedCatalyst = array_column(array_column($matches, 'catalyst'), 'id');

foreach ($ideascaleProfiles as $ideascale) {
    if (in_array($ideascale->id, $alreadyMatchedIdeascale)) continue;
    if (empty($ideascale->name)) continue;
    
    foreach ($catalystProfiles as $catalyst) {
        if (in_array($catalyst->id, $alreadyMatchedCatalyst)) continue;
        if (empty($catalyst->name)) continue;
        
        $ideascaleName = strtolower(trim($ideascale->name));
        $catalystName = strtolower(trim($catalyst->name));
        
        // Check for exact name match or significant overlap
        if ($ideascaleName === $catalystName || 
            strpos($ideascaleName, $catalystName) !== false ||
            strpos($catalystName, $ideascaleName) !== false) {
            
            $confidence = ($ideascaleName === $catalystName) ? 'MEDIUM-HIGH' : 'MEDIUM';
            
            $match = [
                'type' => 'NAME_SIMILARITY_MATCH',
                'confidence' => $confidence,
                'matched_on' => 'name: "' . $ideascale->name . '" vs "' . $catalyst->name . '"',
                'ideascale' => [
                    'id' => $ideascale->id,
                    'name' => $ideascale->name,
                    'username' => $ideascale->username,
                    'email' => $ideascale->email,
                ],
                'catalyst' => [
                    'id' => $catalyst->id,
                    'name' => $catalyst->name, 
                    'username' => $catalyst->username,
                    'catalyst_id' => $catalyst->catalyst_id,
                    'extracted_username' => extractUsernameFromCatalystId($catalyst->catalyst_id),
                ]
            ];
            
            $matches[] = $match;
            $totalMatches++;
        }
    }
}

echo "   Found " . count(array_filter($matches, fn($m) => $m['type'] === 'NAME_SIMILARITY_MATCH')) . " name similarity matches\n\n";

// RESULTS SUMMARY
echo "=== RESULTS SUMMARY ===\n";
echo "Total matches found: $totalMatches\n\n";

// Group by confidence level
$byConfidence = [];
foreach ($matches as $match) {
    $confidence = $match['confidence'];
    if (!isset($byConfidence[$confidence])) {
        $byConfidence[$confidence] = [];
    }
    $byConfidence[$confidence][] = $match;
}

foreach (['HIGH', 'MEDIUM-HIGH', 'MEDIUM', 'LOW'] as $confidence) {
    if (isset($byConfidence[$confidence])) {
        echo "--- $confidence CONFIDENCE MATCHES (" . count($byConfidence[$confidence]) . ") ---\n";
        
        foreach ($byConfidence[$confidence] as $match) {
            echo sprintf(
                "✓ %s [%s]\n   IdeaScale: %s (%s) <%s>\n   Catalyst:  %s (%s)\n   Matched on: %s\n\n",
                $match['type'],
                $match['confidence'],
                $match['ideascale']['name'],
                $match['ideascale']['username'] ?? 'no username',
                $match['ideascale']['email'] ?? 'no email', 
                $match['catalyst']['name'],
                $match['catalyst']['username'] ?? 'no username',
                $match['matched_on']
            );
        }
    }
}

// DETAILED BREAKDOWN
echo "\n=== DETAILED BREAKDOWN ===\n";
echo "Match Types:\n";
foreach (['EXACT_IDENTIFIER_MATCH', 'NAME_SIMILARITY_MATCH'] as $type) {
    $count = count(array_filter($matches, fn($m) => $m['type'] === $type));
    echo "- $type: $count\n";
}

echo "\nConfidence Levels:\n";
foreach (['HIGH', 'MEDIUM-HIGH', 'MEDIUM', 'LOW'] as $confidence) {
    $count = count(array_filter($matches, fn($m) => $m['confidence'] === $confidence));
    echo "- $confidence: $count\n";
}

// EXPORT TO JSON
$outputFile = 'profile_matching_results.json';
file_put_contents($outputFile, json_encode([
    'analysis_date' => date('Y-m-d H:i:s'),
    'total_ideascale_profiles' => $ideascaleProfiles->count(),
    'total_catalyst_profiles' => $catalystProfiles->count(), 
    'total_matches' => $totalMatches,
    'matches' => $matches,
    'summary' => [
        'by_confidence' => array_map('count', $byConfidence),
        'by_type' => [
            'EXACT_IDENTIFIER_MATCH' => count(array_filter($matches, fn($m) => $m['type'] === 'EXACT_IDENTIFIER_MATCH')),
            'NAME_SIMILARITY_MATCH' => count(array_filter($matches, fn($m) => $m['type'] === 'NAME_SIMILARITY_MATCH')),
        ]
    ]
], JSON_PRETTY_PRINT));

echo "\nResults exported to: $outputFile\n";
echo "\nAnalysis complete!\n";