<?php

declare(strict_types=1);

namespace Tests\Feature\Nova\Actions;

use Tests\TestCase;
use App\Models\Proposal;
use App\Models\Link;
use App\Models\Fund;
use App\Models\Campaign;
use App\Models\User;
use App\Nova\Actions\GenerateProposalLinks;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Nova\Fields\ActionFields;
use PHPUnit\Framework\Attributes\Test;

class GenerateProposalLinksTest extends TestCase
{
    use RefreshDatabase;

    private GenerateProposalLinks $action;

    protected function setUp(): void
    {
        parent::setUp();
        $this->action = new GenerateProposalLinks();
    }

    #[Test]
    public function it_can_extract_and_create_links_from_proposal_content()
    {
        // Create test data
        $user = User::factory()->create(['old_id' => rand(1, 10000)]);
        $fund = Fund::factory()->create(['user_id' => $user->old_id]);
        $campaign = Campaign::factory()->create(['fund_id' => $fund->id, 'user_id' => $user->id]);
        
        $proposal = Proposal::factory()->create([
            'fund_id' => $fund->id,
            'campaign_id' => $campaign->id,
            'content' => 'Visit our website at https://example.com and our GitHub repository at https://github.com/example/repo',
            'solution' => 'Our solution documentation is available at https://docs.example.com',
            'problem' => 'More details at https://blog.example.com/problem-analysis',
        ]);

        // Execute the action
        $result = $this->action->handle(new ActionFields([]), collect([$proposal]));

        // Verify links were created
        $this->assertDatabaseHas('links', [
            'link' => 'https://example.com',
            'type' => 'website',
        ]);

        $this->assertDatabaseHas('links', [
            'link' => 'https://github.com/example/repo',
            'type' => 'repository',
        ]);

        $this->assertDatabaseHas('links', [
            'link' => 'https://docs.example.com',
            'type' => 'website',
        ]);

        $this->assertDatabaseHas('links', [
            'link' => 'https://blog.example.com/problem-analysis',
            'type' => 'website',
        ]);

        // Verify links are associated with the proposal
        $this->assertEquals(4, $proposal->fresh()->links()->count());

        // Verify the action response
        $this->assertStringContains('Processed 1 proposals', $result->message);
        $this->assertStringContains('Created 4 new links', $result->message);
    }

    #[Test]
    public function it_does_not_create_duplicate_links()
    {
        // Create existing link
        $existingLink = Link::factory()->create([
            'link' => 'https://example.com',
            'type' => 'website',
        ]);

        $user = User::factory()->create(['old_id' => rand(1, 10000)]);
        $fund = Fund::factory()->create(['user_id' => $user->old_id]);
        $campaign = Campaign::factory()->create(['fund_id' => $fund->id, 'user_id' => $user->id]);
        
        $proposal = Proposal::factory()->create([
            'fund_id' => $fund->id,
            'campaign_id' => $campaign->id,
            'content' => 'Visit https://example.com for more info',
        ]);

        // Execute the action
        $result = $this->action->handle(new ActionFields([]), collect([$proposal]));

        // Verify no duplicate link was created
        $this->assertEquals(1, Link::where('link', 'https://example.com')->count());

        // Verify the existing link is associated with the proposal
        $this->assertEquals(1, $proposal->fresh()->links()->count());
        $this->assertEquals($existingLink->id, $proposal->fresh()->links()->first()->id);

        // Verify the action response
        $this->assertStringContains('Processed 1 proposals', $result->message);
        $this->assertStringContains('Created 0 new links', $result->message);
    }

    #[Test]
    public function it_handles_proposals_with_no_urls()
    {
        $user = User::factory()->create(['old_id' => rand(1, 10000)]);
        $fund = Fund::factory()->create(['user_id' => $user->old_id]);
        $campaign = Campaign::factory()->create(['fund_id' => $fund->id, 'user_id' => $user->id]);
        
        $proposal = Proposal::factory()->create([
            'fund_id' => $fund->id,
            'campaign_id' => $campaign->id,
            'content' => 'This proposal has no URLs in the content',
            'solution' => 'Just plain text describing the solution',
            'problem' => 'The problem statement without any links',
        ]);

        // Execute the action
        $result = $this->action->handle(new ActionFields([]), collect([$proposal]));

        // Verify no links were created
        $this->assertEquals(0, $proposal->fresh()->links()->count());

        // Verify the action response
        $this->assertStringContains('Processed 1 proposals', $result->message);
        $this->assertStringContains('Created 0 new links', $result->message);
    }

    #[Test]
    public function it_categorizes_links_correctly()
    {
        $user = User::factory()->create(['old_id' => rand(1, 10000)]);
        $fund = Fund::factory()->create(['user_id' => $user->old_id]);
        $campaign = Campaign::factory()->create(['fund_id' => $fund->id, 'user_id' => $user->id]);
        
        $proposal = Proposal::factory()->create([
            'fund_id' => $fund->id,
            'campaign_id' => $campaign->id,
            'content' => 'Follow us on https://twitter.com/example and see our code at https://github.com/example/repo',
            'solution' => 'Watch our demo at https://youtube.com/watch?v=123',
        ]);

        // Execute the action
        $this->action->handle(new ActionFields([]), collect([$proposal]));

        // Verify different link types were created
        $this->assertDatabaseHas('links', [
            'link' => 'https://twitter.com/example',
            'type' => 'twitter',
        ]);

        $this->assertDatabaseHas('links', [
            'link' => 'https://github.com/example/repo',
            'type' => 'repository',
        ]);

        $this->assertDatabaseHas('links', [
            'link' => 'https://youtube.com/watch?v=123',
            'type' => 'youtube',
        ]);
    }

    #[Test]
    public function it_normalizes_urls_correctly()
    {
        $user = User::factory()->create(['old_id' => rand(1, 10000)]);
        $fund = Fund::factory()->create(['user_id' => $user->old_id]);
        $campaign = Campaign::factory()->create(['fund_id' => $fund->id, 'user_id' => $user->id]);
        
        $proposal = Proposal::factory()->create([
            'fund_id' => $fund->id,
            'campaign_id' => $campaign->id,
            'content' => 'Visit example.com/ and also check http://example.com',
        ]);

        // Execute the action
        $this->action->handle(new ActionFields([]), collect([$proposal]));

        // Verify only one normalized link was created
        $this->assertEquals(1, Link::where('link', 'https://example.com')->count());
        $this->assertEquals(0, Link::where('link', 'LIKE', '%example.com/%')->count());
        $this->assertEquals(1, $proposal->fresh()->links()->count());
    }

    #[Test]
    public function it_handles_multiple_proposals()
    {
        $user = User::factory()->create(['old_id' => rand(1, 10000)]);
        $fund = Fund::factory()->create(['user_id' => $user->old_id]);
        $campaign = Campaign::factory()->create(['fund_id' => $fund->id, 'user_id' => $user->id]);
        
        $proposal1 = Proposal::factory()->create([
            'fund_id' => $fund->id,
            'campaign_id' => $campaign->id,
            'content' => 'Visit https://example1.com',
        ]);

        $proposal2 = Proposal::factory()->create([
            'fund_id' => $fund->id,
            'campaign_id' => $campaign->id,
            'content' => 'Visit https://example2.com',
        ]);

        // Execute the action on multiple proposals
        $result = $this->action->handle(new ActionFields([]), collect([$proposal1, $proposal2]));

        // Verify links were created for both proposals
        $this->assertEquals(1, $proposal1->fresh()->links()->count());
        $this->assertEquals(1, $proposal2->fresh()->links()->count());

        // Verify the action response
        $this->assertStringContains('Processed 2 proposals', $result->message);
        $this->assertStringContains('Created 2 new links', $result->message);
    }
}