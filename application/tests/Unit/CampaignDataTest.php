<?php

declare(strict_types=1);

use App\DataTransferObjects\CampaignData;
use Tests\TestCase;

class CampaignDataTest extends TestCase
{
    /** @test */
    public function it_handles_null_id_gracefully_with_safe_factory(): void
    {
        // Arrange: Create data with null ID (like from search results)
        $campaignData = [
            'id' => null,
            'fund_id' => 'test-fund-id',
            'title' => 'Test Campaign',
            'meta_title' => null,
            'slug' => 'test-campaign',
            'excerpt' => null,
            'comment_prompt' => null,
            'content' => null,
            'hero_img_url' => null,
            'amount' => 100.0,
            'created_at' => '2024-01-01T00:00:00Z',
            'updated_at' => '2024-01-01T00:00:00Z',
            'label' => 'Test Label',
            'currency' => 'ADA',
            'proposals_count' => 5,
            'unfunded_proposals_count' => 1,
            'funded_proposals_count' => 3,
            'completed_proposals_count' => 1,
            'total_requested' => 1000.0,
            'total_awarded' => 800.0,
            'total_distributed' => 600.0,
            'fund' => null,
        ];

        // Act: Use safe factory method
        $campaign = CampaignData::fromArraySafe($campaignData);

        // Assert: Should create successfully with null ID
        $this->assertInstanceOf(CampaignData::class, $campaign);
        $this->assertNull($campaign->id);
        $this->assertEquals('Test Campaign', $campaign->title);
        $this->assertEquals('test-campaign', $campaign->slug);
    }

    /** @test */
    public function it_returns_null_for_completely_empty_campaign_data(): void
    {
        // Arrange: Create minimal data that should be rejected
        $campaignData = [
            'id' => null,
            'title' => null,
            'slug' => null,
        ];

        // Act: Use safe factory method
        $campaign = CampaignData::fromArraySafe($campaignData);

        // Assert: Should return null for invalid data
        $this->assertNull($campaign);
    }

    /** @test */
    public function it_handles_valid_campaign_data_normally(): void
    {
        // Arrange: Create valid campaign data
        $campaignData = [
            'id' => 'campaign-123',
            'fund_id' => 'fund-456',
            'title' => 'Valid Campaign',
            'meta_title' => 'Meta Title',
            'slug' => 'valid-campaign',
            'excerpt' => 'Campaign excerpt',
            'comment_prompt' => null,
            'content' => 'Campaign content',
            'hero_img_url' => 'https://example.com/image.jpg',
            'amount' => 1000.0,
            'created_at' => '2024-01-01T00:00:00Z',
            'updated_at' => '2024-01-01T00:00:00Z',
            'label' => 'Valid Label',
            'currency' => 'ADA',
            'proposals_count' => 10,
            'unfunded_proposals_count' => 2,
            'funded_proposals_count' => 6,
            'completed_proposals_count' => 2,
            'total_requested' => 5000.0,
            'total_awarded' => 4000.0,
            'total_distributed' => 3000.0,
            'fund' => null,
        ];

        // Act: Use safe factory method
        $campaign = CampaignData::fromArraySafe($campaignData);

        // Assert: Should create successfully with valid data
        $this->assertInstanceOf(CampaignData::class, $campaign);
        $this->assertEquals('campaign-123', $campaign->id);
        $this->assertEquals('Valid Campaign', $campaign->title);
        $this->assertEquals('valid-campaign', $campaign->slug);
        $this->assertEquals(1000.0, $campaign->amount);
    }
}