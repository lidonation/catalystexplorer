<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\Debug;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProposalResource;
use App\Models\Proposal;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Spatie\QueryBuilder\AllowedInclude;
use Spatie\QueryBuilder\QueryBuilder;

class ProposalDebugController extends Controller
{
    /**
     * Debug endpoint to troubleshoot missing campaign relations
     */
    public function debug(Request $request): array
    {
        // First, let's get the problematic proposal directly
        $proposal = Proposal::with(['campaign', 'fund'])->find(2);
        
        $debug = [
            'direct_query' => [
                'id' => $proposal?->id,
                'title' => $proposal?->title,
                'campaign_id' => $proposal?->campaign_id,
                'campaign_relation_loaded' => $proposal ? $proposal->relationLoaded('campaign') : false,
                'campaign_exists' => $proposal?->campaign ? true : false,
                'campaign_data' => $proposal?->campaign ? [
                    'id' => $proposal->campaign->id,
                    'title' => $proposal->campaign->title,
                ] : null,
            ]
        ];
        
        // Now test with QueryBuilder like the API does
        $proposals = QueryBuilder::for(Proposal::class)
            ->allowedIncludes([
                AllowedInclude::relationship('campaign'),
                AllowedInclude::relationship('fund'),
            ])
            ->where('id', 2)
            ->with(['campaign', 'fund'])  // Force load relations
            ->first();
            
        $debug['query_builder'] = [
            'found' => $proposals ? true : false,
            'campaign_relation_loaded' => $proposals ? $proposals->relationLoaded('campaign') : false,
            'campaign_exists' => $proposals?->campaign ? true : false,
            'campaign_data' => $proposals?->campaign ? [
                'id' => $proposals->campaign->id,
                'title' => $proposals->campaign->title,
            ] : null,
        ];
        
        // Test pagination like the API
        $paginatedProposals = QueryBuilder::for(Proposal::class)
            ->allowedIncludes([
                AllowedInclude::relationship('campaign'),
                AllowedInclude::relationship('fund'),
            ])
            ->take(5)
            ->get();
            
        $debug['paginated_results'] = [];
        foreach ($paginatedProposals as $prop) {
            $debug['paginated_results'][] = [
                'id' => $prop->id,
                'title' => substr($prop->title ?? '', 0, 50),
                'campaign_id' => $prop->campaign_id,
                'campaign_loaded' => $prop->relationLoaded('campaign'),
                'campaign_exists' => $prop->campaign ? true : false,
            ];
        }
        
        // Check if there are any proposals with missing campaign_id but should have one
        $proposalsWithoutCampaigns = Proposal::whereNull('campaign_id')->count();
        $proposalsWithCampaigns = Proposal::whereNotNull('campaign_id')->count();
        
        $debug['database_stats'] = [
            'total_proposals' => Proposal::count(),
            'proposals_without_campaigns' => $proposalsWithoutCampaigns,
            'proposals_with_campaigns' => $proposalsWithCampaigns,
        ];
        
        return $debug;
    }
    
    /**
     * Test the actual API endpoint logic
     */
    public function testApi(Request $request): AnonymousResourceCollection
    {
        $per_page = 5; // Small number for testing
        
        $proposals = QueryBuilder::for(Proposal::class)
            ->allowedIncludes([
                AllowedInclude::relationship('campaign'),
                AllowedInclude::relationship('fund'),
            ])
            ->defaultSort('-created_at')
            ->paginate($per_page);

        return ProposalResource::collection($proposals);
    }
    
    /**
     * Check for specific proposals that might be missing campaign data
     */
    public function checkSpecific(Request $request): array
    {
        // Get proposals that should have campaigns but might not be loading them
        $proposals = Proposal::with(['campaign', 'fund'])
            ->whereNotNull('campaign_id')
            ->take(10)
            ->get();
            
        $results = [];
        foreach ($proposals as $proposal) {
            $results[] = [
                'id' => $proposal->id,
                'title' => substr($proposal->title ?? '', 0, 50),
                'campaign_id' => $proposal->campaign_id,
                'campaign_loaded' => $proposal->relationLoaded('campaign'),
                'campaign_exists' => $proposal->campaign ? true : false,
                'campaign_title' => $proposal->campaign?->title,
                'raw_campaign_data' => $proposal->campaign ? [
                    'id' => $proposal->campaign->id,
                    'title' => $proposal->campaign->title,
                    'fund_id' => $proposal->campaign->fund_id ?? null,
                ] : null,
            ];
        }
        
        return [
            'proposals_checked' => count($results),
            'proposals' => $results,
        ];
    }
}