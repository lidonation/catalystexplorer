<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use App\Models\Proposal;
use App\Models\Campaign;
use App\Models\Fund;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Find proposals missing campaign relations and attempt to fix them
        $this->fixMissingCampaignRelations();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // This migration doesn't create schema changes, so no rollback needed
        // If needed, we could log the changes made and reverse them
    }

    private function fixMissingCampaignRelations(): void
    {
        echo "\n=== Fixing Missing Proposal Campaign Relations ===\n";
        
        $proposalsWithoutCampaign = Proposal::whereNull('campaign_id')->get();
        echo "Found {$proposalsWithoutCampaign->count()} proposals without campaign relations\n";
        
        $fixed = 0;
        $unfixed = 0;
        
        foreach ($proposalsWithoutCampaign as $proposal) {
            // Special handling for cPoker Development - assign to Products & Integrations
            if (stripos($proposal->title, 'cPoker') !== false) {
                $campaignId = $this->findSpecificCampaignForCPoker($proposal);
            } else {
                $campaignId = $this->findCampaignForProposal($proposal);
            }
            
            if ($campaignId) {
                $proposal->campaign_id = $campaignId;
                $proposal->save();
                
                // Index the proposal into Scout search after fixing
                try {
                    $proposal->searchable();
                    echo "✓ Fixed & Indexed: {$proposal->title}\n";
                } catch (\Exception $e) {
                    echo "✓ Fixed (Index failed): {$proposal->title} - {$e->getMessage()}\n";
                }
                
                $fixed++;
            } else {
                $unfixed++;
                echo "✗ Could not find campaign for: {$proposal->title}\n";
            }
        }
        
        echo "\nResults:\n";
        echo "- Fixed & Indexed: {$fixed}\n";
        echo "- Unfixed: {$unfixed}\n";
        echo "- All fixed proposals have been indexed into Scout search\n";
    }

    private function findCampaignForProposal(Proposal $proposal): ?string
    {
        // Strategy 1: Find similar proposals in previous funds and use their campaign
        $similarTitle = trim(strtolower($proposal->title));
        
        // Look for proposals with similar titles in other funds
        $similarProposals = Proposal::where('title', 'ILIKE', '%' . $similarTitle . '%')
            ->whereNotNull('campaign_id')
            ->where('fund_id', '!=', $proposal->fund_id)
            ->with('campaign')
            ->get();
        
        if ($similarProposals->isNotEmpty()) {
            // Group by campaign title to find the most common campaign type
            $campaignTitles = $similarProposals->groupBy(function ($item) {
                return strtolower(trim($item->campaign->title ?? ''));
            });
            
            // Get the most common campaign title
            $mostCommonCampaignTitle = $campaignTitles->sortByDesc(function ($group) {
                return $group->count();
            })->keys()->first();
            
            if ($mostCommonCampaignTitle) {
                // Find a campaign with similar title in the same fund
                $matchingCampaign = Campaign::where('fund_id', $proposal->fund_id)
                    ->where('title', 'ILIKE', '%' . $mostCommonCampaignTitle . '%')
                    ->first();
                
                if ($matchingCampaign) {
                    return $matchingCampaign->id;
                }
            }
        }
        
        // Strategy 2: Find campaigns with similar keywords in the same fund
        $titleWords = explode(' ', strtolower($proposal->title));
        $titleWords = array_filter($titleWords, function($word) {
            return strlen($word) > 3; // Only consider words longer than 3 characters
        });
        
        if (!empty($titleWords)) {
            foreach ($titleWords as $word) {
                $matchingCampaign = Campaign::where('fund_id', $proposal->fund_id)
                    ->where('title', 'ILIKE', '%' . $word . '%')
                    ->first();
                    
                if ($matchingCampaign) {
                    return $matchingCampaign->id;
                }
            }
        }
        
        // Strategy 3: Use default campaign in the same fund (if there's one general campaign)
        $defaultCampaign = Campaign::where('fund_id', $proposal->fund_id)
            ->where(function($query) {
                $query->where('title', 'ILIKE', '%general%')
                      ->orWhere('title', 'ILIKE', '%open%')
                      ->orWhere('title', 'ILIKE', '%misc%')
                      ->orWhere('title', 'ILIKE', '%other%')
                      ->orWhere('title', 'ILIKE', '%dapp%')
                      ->orWhere('title', 'ILIKE', '%development%');
            })
            ->first();
            
        if ($defaultCampaign) {
            return $defaultCampaign->id;
        }
        
        // Strategy 4: Use the first available campaign in the same fund as fallback
        $anyCampaign = Campaign::where('fund_id', $proposal->fund_id)->first();
        
        return $anyCampaign ? $anyCampaign->id : null;
    }
    
    private function findSpecificCampaignForCPoker(Proposal $proposal): ?string
    {
        // Look for Products & Integrations campaign in the same fund as cPoker
        $productsIntegrationsCampaign = Campaign::where('fund_id', $proposal->fund_id)
            ->where(function($query) {
                $query->where('title', 'ILIKE', '%Products%Integrations%')
                      ->orWhere('title', 'ILIKE', '%Products & Integrations%')
                      ->orWhere('title', 'ILIKE', '%Products and Integrations%')
                      ->orWhere('title', 'ILIKE', '%Product%Integration%');
            })
            ->first();
            
        if ($productsIntegrationsCampaign) {
            echo "   → Assigning to Products & Integrations campaign: {$productsIntegrationsCampaign->title}\n";
            return $productsIntegrationsCampaign->id;
        }
        
        // Fallback to any campaign with "product" in the name
        $productCampaign = Campaign::where('fund_id', $proposal->fund_id)
            ->where('title', 'ILIKE', '%product%')
            ->first();
            
        if ($productCampaign) {
            echo "   → Assigning to product-related campaign: {$productCampaign->title}\n";
            return $productCampaign->id;
        }
        
        // Final fallback - use the general strategy
        echo "   → No specific Products & Integrations campaign found, using general strategy\n";
        return $this->findCampaignForProposal($proposal);
    }
};
