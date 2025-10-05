<?php

/**
 * Profile Matching Analysis Report
 * 
 * Analyzes potential connections between IdeaScale and Catalyst profiles
 */

// Set up basic output
$startTime = microtime(true);
$report = [
    'analysis_date' => date('Y-m-d H:i:s'),
    'summary' => [],
    'matches' => [],
    'stats' => []
];

echo "=== CATALYST EXPLORER: PROFILE MATCHING ANALYSIS ===\n";
echo "Started at: " . $report['analysis_date'] . "\n\n";

// Helper function to extract username from catalyst_id
function extractUsernameFromCatalystId($catalystId) {
    if (empty($catalystId) || strpos($catalystId, 'id.catalyst://') !== 0) {
        return null;
    }
    
    $afterProtocol = substr($catalystId, 14);
    $beforeCardano = explode('@cardano/', $afterProtocol)[0];
    $decoded = urldecode($beforeCardano);
    
    return strtolower(trim($decoded));
}

// Helper function to clean and normalize usernames
function normalizeUsername($username) {
    if (empty($username)) return null;
    return strtolower(trim($username));
}

echo "1. ANALYZING CATALYST PROFILES...\n";

// Load catalyst profiles and create lookup
$catalystProfiles = [];
$catalystUsernameLookup = [];
$catalystIdLookup = [];

// Use chunked processing to handle memory better
$chunkSize = 100;
$totalCatalyst = 0;

DB::table('catalyst_profiles')
    ->orderBy('id')
    ->chunk($chunkSize, function ($profiles) use (&$catalystProfiles, &$catalystUsernameLookup, &$catalystIdLookup, &$totalCatalyst) {
        foreach ($profiles as $profile) {
            $totalCatalyst++;
            $catalystProfiles[$profile->id] = $profile;
            
            // Index by username
            if (!empty($profile->username)) {
                $normalizedUsername = normalizeUsername($profile->username);
                $catalystUsernameLookup[$normalizedUsername][] = $profile->id;
            }
            
            // Index by extracted catalyst_id
            if (!empty($profile->catalyst_id)) {
                $extractedUsername = extractUsernameFromCatalystId($profile->catalyst_id);
                if (!empty($extractedUsername)) {
                    $catalystIdLookup[$extractedUsername][] = $profile->id;
                }
            }
        }
    });

echo "   Processed {$totalCatalyst} catalyst profiles\n";
echo "   Created " . count($catalystUsernameLookup) . " username lookups\n";
echo "   Created " . count($catalystIdLookup) . " catalyst_id lookups\n\n";

echo "2. ANALYZING IDEASCALE PROFILES...\n";

$totalIdeascale = 0;
$matches = [];
$matchTypes = [
    'username_to_username' => 0,
    'username_to_catalyst_id' => 0,
    'email_to_username' => 0,
    'email_to_catalyst_id' => 0,
    'name_similarity' => 0
];

DB::table('ideascale_profiles')
    ->whereNotNull('username')
    ->orWhereNotNull('email')
    ->orderBy('id')
    ->chunk($chunkSize, function ($ideascaleProfiles) use (
        &$matches, 
        &$matchTypes, 
        &$totalIdeascale, 
        $catalystProfiles, 
        $catalystUsernameLookup, 
        $catalystIdLookup
    ) {
        foreach ($ideascaleProfiles as $ideascale) {
            $totalIdeascale++;
            
            // Extract searchable identifiers from ideascale profile
            $searchableIds = [];
            
            if (!empty($ideascale->username)) {
                $searchableIds['username'] = normalizeUsername($ideascale->username);
            }
            
            if (!empty($ideascale->email)) {
                $emailParts = explode('@', $ideascale->email);
                if (count($emailParts) > 1) {
                    $searchableIds['email_prefix'] = normalizeUsername($emailParts[0]);
                }
            }
            
            // Check for matches
            foreach ($searchableIds as $sourceType => $searchId) {
                if (empty($searchId)) continue;
                
                // Check against catalyst usernames
                if (isset($catalystUsernameLookup[$searchId])) {
                    foreach ($catalystUsernameLookup[$searchId] as $catalystId) {
                        $catalyst = $catalystProfiles[$catalystId];
                        
                        $matchType = $sourceType === 'username' ? 'username_to_username' : 'email_to_username';
                        $matchTypes[$matchType]++;
                        
                        $matches[] = [
                            'type' => $matchType,
                            'confidence' => 'HIGH',
                            'matched_on' => $searchId,
                            'ideascale' => [
                                'id' => $ideascale->id,
                                'name' => $ideascale->name,
                                'username' => $ideascale->username,
                                'email' => $ideascale->email
                            ],
                            'catalyst' => [
                                'id' => $catalyst->id,
                                'name' => $catalyst->name,
                                'username' => $catalyst->username,
                                'catalyst_id' => $catalyst->catalyst_id
                            ]
                        ];
                    }
                }
                
                // Check against catalyst_id extractions
                if (isset($catalystIdLookup[$searchId])) {
                    foreach ($catalystIdLookup[$searchId] as $catalystId) {
                        $catalyst = $catalystProfiles[$catalystId];
                        
                        $matchType = $sourceType === 'username' ? 'username_to_catalyst_id' : 'email_to_catalyst_id';
                        $matchTypes[$matchType]++;
                        
                        $matches[] = [
                            'type' => $matchType,
                            'confidence' => 'MEDIUM-HIGH',
                            'matched_on' => $searchId,
                            'ideascale' => [
                                'id' => $ideascale->id,
                                'name' => $ideascale->name,
                                'username' => $ideascale->username,
                                'email' => $ideascale->email
                            ],
                            'catalyst' => [
                                'id' => $catalyst->id,
                                'name' => $catalyst->name,
                                'username' => $catalyst->username,
                                'catalyst_id' => $catalyst->catalyst_id,
                                'extracted_username' => extractUsernameFromCatalystId($catalyst->catalyst_id)
                            ]
                        ];
                    }
                }
            }
        }
    });

echo "   Processed {$totalIdeascale} ideascale profiles\n";
echo "   Found " . count($matches) . " total matches\n\n";

// Generate summary
$report['stats'] = [
    'total_catalyst_profiles' => $totalCatalyst,
    'total_ideascale_profiles' => $totalIdeascale,
    'total_matches' => count($matches),
    'unique_catalyst_matched' => count(array_unique(array_column(array_column($matches, 'catalyst'), 'id'))),
    'unique_ideascale_matched' => count(array_unique(array_column(array_column($matches, 'ideascale'), 'id'))),
    'match_types' => $matchTypes
];

$report['matches'] = $matches;

// Display results
echo "=== RESULTS SUMMARY ===\n";
echo "Total Matches Found: " . count($matches) . "\n";
echo "Unique Catalyst Profiles Matched: " . $report['stats']['unique_catalyst_matched'] . "\n";
echo "Unique IdeaScale Profiles Matched: " . $report['stats']['unique_ideascale_matched'] . "\n\n";

echo "Match Types:\n";
foreach ($matchTypes as $type => $count) {
    if ($count > 0) {
        echo "- " . str_replace('_', ' ', ucwords($type, '_')) . ": {$count}\n";
    }
}

echo "\n=== TOP 20 MATCHES ===\n";
$displayLimit = min(20, count($matches));

for ($i = 0; $i < $displayLimit; $i++) {
    $match = $matches[$i];
    echo ($i + 1) . ". " . strtoupper(str_replace('_', ' ', $match['type'])) . " [{$match['confidence']}]\n";
    echo "   Matched on: '{$match['matched_on']}'\n";
    echo "   IdeaScale: {$match['ideascale']['name']}";
    if ($match['ideascale']['username']) echo " (@{$match['ideascale']['username']})";
    if ($match['ideascale']['email']) echo " <{$match['ideascale']['email']}>";
    echo "\n";
    echo "   Catalyst:  {$match['catalyst']['name']}";
    if ($match['catalyst']['username']) echo " (@{$match['catalyst']['username']})";
    echo "\n";
    if (isset($match['catalyst']['extracted_username'])) {
        echo "   Catalyst ID extracted: '{$match['catalyst']['extracted_username']}'\n";
    }
    echo "\n";
}

if (count($matches) > $displayLimit) {
    echo "... and " . (count($matches) - $displayLimit) . " more matches\n\n";
}

// Save to JSON file
$outputFile = 'catalyst_ideascale_profile_matches.json';
file_put_contents($outputFile, json_encode($report, JSON_PRETTY_PRINT));

$endTime = microtime(true);
$executionTime = round($endTime - $startTime, 2);

echo "=== ANALYSIS COMPLETE ===\n";
echo "Execution time: {$executionTime} seconds\n";
echo "Results saved to: {$outputFile}\n";
echo "\nThis analysis identified potential connections between IdeaScale and Catalyst profiles based on:\n";
echo "- Exact username matches\n";
echo "- Email prefix to username matches\n";
echo "- Username to catalyst_id extraction matches\n";
echo "- Email prefix to catalyst_id extraction matches\n\n";

if (count($matches) > 0) {
    echo "RECOMMENDATION: Review the HIGH confidence matches first, as these represent\n";
    echo "the strongest evidence that the same person has profiles on both platforms.\n";
} else {
    echo "No direct matches were found. This could indicate:\n";
    echo "- Users use different identifiers across platforms\n";
    echo "- The platforms have different user bases\n";
    echo "- Additional fuzzy matching techniques may be needed\n";
}

echo "\n";