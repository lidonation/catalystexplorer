<?php

declare(strict_types=1);

namespace Tests\Unit\Jobs;

use App\Enums\CatalystFunds;
use App\Jobs\UpdateTallyRank;
use App\Models\Campaign;
use App\Models\CatalystTally;
use App\Models\Fund;
use App\Models\Proposal;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UpdateTallyRankTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that approval chance is calculated correctly based on historical data
     */
    public function test_approval_chance_calculation(): void
    {
        // Create test data
        $fund13 = Fund::factory()->create(['id' => '13']);
        $fund14 = Fund::factory()->create(['id' => CatalystFunds::FOURTEEN]);
        $campaign = Campaign::factory()->create();

        // Create historical proposals in Fund 13 with different funding statuses
        $fundedProposal1 = Proposal::factory()->create([
            'fund_id' => $fund13->id,
            'campaign_id' => $campaign->id,
            'funding_status' => 'funded'
        ]);
        
        $fundedProposal2 = Proposal::factory()->create([
            'fund_id' => $fund13->id,
            'campaign_id' => $campaign->id,
            'funding_status' => 'funded'
        ]);
        
        $unfundedProposal = Proposal::factory()->create([
            'fund_id' => $fund13->id,
            'campaign_id' => $campaign->id,
            'funding_status' => 'not_approved'
        ]);

        // Create current fund proposal (Fund 14)
        $currentProposal = Proposal::factory()->create([
            'fund_id' => $fund14->id,
            'campaign_id' => $campaign->id
        ]);

        // Create tallies for historical proposals
        $tally1 = CatalystTally::factory()->create([
            'model_id' => $fundedProposal1->id,
            'context_id' => $fund13->id,
            'tally' => 1000
        ]);
        
        $tally2 = CatalystTally::factory()->create([
            'model_id' => $fundedProposal2->id,
            'context_id' => $fund13->id,
            'tally' => 900
        ]);
        
        $tally3 = CatalystTally::factory()->create([
            'model_id' => $unfundedProposal->id,
            'context_id' => $fund13->id,
            'tally' => 800
        ]);

        // Create tally for current fund proposal
        $currentTally = CatalystTally::factory()->create([
            'model_id' => $currentProposal->id,
            'context_id' => $fund14->id,
            'tally' => 950
        ]);

        // Set category ranks for all tallies (same rank for comparison)
        $categoryRank = 1;
        $tally1->saveMeta('category_rank', $categoryRank);
        $tally2->saveMeta('category_rank', $categoryRank);
        $tally3->saveMeta('category_rank', $categoryRank);
        $currentTally->saveMeta('category_rank', $categoryRank);

        // Run the job
        $job = new UpdateTallyRank();
        $job->updateApprovalChance();

        // Refresh the current tally to get updated metadata
        $currentTally->refresh();

        // Expected approval chance: 2 funded out of 3 total = 66.67%
        $expectedChance = 66.67;
        $actualChance = $currentTally->meta_info->chance ?? null;

        $this->assertNotNull($actualChance, 'Approval chance should be calculated and stored');
        $this->assertEquals($expectedChance, $actualChance, 'Approval chance should be calculated correctly');
    }

    /**
     * Test that approval chance returns 0 when no historical data exists
     */
    public function test_approval_chance_with_no_historical_data(): void
    {
        $fund14 = Fund::factory()->create(['id' => CatalystFunds::FOURTEEN]);
        $campaign = Campaign::factory()->create();

        // Create current fund proposal with no historical data
        $currentProposal = Proposal::factory()->create([
            'fund_id' => $fund14->id,
            'campaign_id' => $campaign->id
        ]);

        $currentTally = CatalystTally::factory()->create([
            'model_id' => $currentProposal->id,
            'context_id' => $fund14->id,
            'tally' => 950
        ]);

        // Set category rank
        $currentTally->saveMeta('category_rank', 1);

        // Run the job
        $job = new UpdateTallyRank();
        $job->updateApprovalChance();

        // Refresh the tally to get updated metadata
        $currentTally->refresh();

        // Expected approval chance: 0% (no historical data)
        $actualChance = $currentTally->meta_info->chance ?? null;

        $this->assertNotNull($actualChance, 'Approval chance should be stored even when 0');
        $this->assertEquals(0.0, $actualChance, 'Approval chance should be 0 when no historical data exists');
    }
}