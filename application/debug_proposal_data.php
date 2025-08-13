<?php

use App\Models\Proposal;

require_once __DIR__.'/vendor/autoload.php';

// Bootstrap Laravel
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Debugging proposal data array...\n\n";

try {
    $slug = 'decentralised-funding - report-f2';
    
    $proposal = Proposal::where('slug', $slug)->firstOrFail();
    
    // Manually build data like the controller does
    $data = [
        'id' => $proposal->getKey(), // Use getKey() to get the primary key value
        'user_id' => $proposal->user_id,
        'title' => $proposal->title,
        'slug' => $proposal->slug,
        'website' => $proposal->website,
        'excerpt' => $proposal->excerpt,
        'content' => $proposal->content,
        'amount_requested' => $proposal->amount_requested,
        'amount_received' => $proposal->amount_received,
        'definition_of_success' => $proposal->definition_of_success,
        'status' => $proposal->status,
        'funding_status' => $proposal->funding_status,
        'funded_at' => $proposal->funded_at,
        'deleted_at' => $proposal->deleted_at,
        'funding_updated_at' => $proposal->funding_updated_at,
        'yes_votes_count' => $proposal->yes_votes_count,
        'no_votes_count' => $proposal->no_votes_count,
        'abstain_votes_count' => $proposal->abstain_votes_count,
        'comment_prompt' => $proposal->comment_prompt,
        'social_excerpt' => $proposal->social_excerpt,
        'ideascale_link' => $proposal->ideascale_link,
        'projectcatalyst_io_link' => $proposal->projectcatalyst_io_url ?? null,
        'type' => $proposal->type,
        'meta_title' => $proposal->meta_title,
        'problem' => $proposal->problem,
        'solution' => $proposal->solution,
        'experience' => $proposal->experience,
        'currency' => $proposal->currency,
        'minted_nfts_fingerprint' => null,
        'ranking_total' => $proposal->ranking_total,
        'quickpitch' => $proposal->quickpitch,
        'quickpitch_length' => $proposal->quickpitch_length,
        'opensource' => $proposal->opensource,
        'link' => $proposal->link,
        'order' => null,
        'campaign' => null,
        'schedule' => null,
        'fund' => null,
        'reviews' => [],
        'alignment_score' => 0,
        'feasibility_score' => 0, 
        'auditability_score' => 0,
        'users' => [],
        'groups' => [],
        'userCompleteProposalsCount' => 0,
        'userOutstandingProposalsCount' => 0,
        'catalystConnectionsCount' => 0,
    ];
    
    echo "Final data array keys:\n";
    foreach (array_keys($data) as $key) {
        echo "- $key\n";
    }
    
    echo "\nID present: " . (array_key_exists('id', $data) ? 'YES' : 'NO') . "\n";
    if (array_key_exists('id', $data)) {
        echo "ID value: " . $data['id'] . "\n";
        echo "ID type: " . gettype($data['id']) . "\n";
    }
    
    echo "\nTotal parameters: " . count($data) . "\n";
    
} catch (\Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "\n";
}

echo "\nDebugging completed.\n";
