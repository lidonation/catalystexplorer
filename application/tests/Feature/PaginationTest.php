<?php

namespace Tests\Feature;

use App\Models\Campaign;
use App\Models\Fund;
use App\Models\Group;
use App\Models\IdeascaleProfile;
use App\Models\Proposal;
use App\Models\User;
use App\Repositories\GroupRepository;
use App\Repositories\IdeascaleProfileRepository;
use App\Repositories\ProposalRepository;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Laravel\Scout\Builder;
use Mockery;
use Tests\TestCase;

class PaginationTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @var \App\Models\User
     */
    protected $user;
    
    /**
     * @var \Mockery\MockInterface
     */
    protected $proposalRepository;
    
    /**
     * @var \Mockery\MockInterface
     */
    protected $groupRepository;
    
    /**
     * @var \Mockery\MockInterface
     */
    protected $ideascaleProfileRepository;

    public function setUp(): void
    {
        parent::setUp();

        // Create a user for authentication if needed
        $this->user = User::factory()->create();
        
        // Mock the repositories to avoid real MeiliSearch calls
        $this->mockRepositories();
    }

    public function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }
    
    /**
     * Mock repositories to return controlled test data
     */
    protected function mockRepositories(): void
    {
        $this->proposalRepository = Mockery::mock(ProposalRepository::class);
        $this->app->instance(ProposalRepository::class, $this->proposalRepository);
        
        $this->groupRepository = Mockery::mock(GroupRepository::class);
        $this->app->instance(GroupRepository::class, $this->groupRepository);
        
        $this->ideascaleProfileRepository = Mockery::mock(IdeascaleProfileRepository::class);
        $this->app->instance(IdeascaleProfileRepository::class, $this->ideascaleProfileRepository);
    }
    
    /**
     * Configure mock repository to return paginated data for a specific entity
     */
    protected function setupMockPagination(
        string $repository,
        array $items,
        int $totalCount, 
        int $perPage = 36, 
        int $page = 1, 
        array $filters = [],
        array $facetDistribution = []
    ): void {
        // Create a raw MeiliSearch-like response
        $rawResponse = [
            'hits' => $items,
            'estimatedTotalHits' => $totalCount,
            'facetDistribution' => $facetDistribution ?: [
                'status' => ['approved' => 15, 'rejected' => 10],
                'funding_status' => ['funded' => 25]
            ],
            'facetStats' => []
        ];
        
        // Create and configure a properly typed builder mock
        $builder = Mockery::mock(Builder::class);
        $builder->shouldReceive('raw')->andReturn($rawResponse);
        
        // Configure repository mock based on type
        $repoProperty = "{$repository}Repository";
        $this->$repoProperty->shouldReceive('search')
            ->withAnyArgs()
            ->andReturn($builder);
    }

    /**
     * Test basic pagination for proposals index
     */
    public function test_proposals_index_shows_pagination(): void
    {
        $this->withoutExceptionHandling();
        // Create test data
        $fund = Fund::factory()->create();
        $campaign = Campaign::factory()->for($fund, 'fund')->create();
        $proposals = Proposal::factory()->count(50)->state([
            'campaign_id' => $campaign->id,
            'fund_id' => $fund->id,
        ])->create();
        
        // Configure mock for first page
        $this->setupMockPagination('proposal', $proposals->take(36)->toArray(), 50);
        
        // Test first page
        $response = $this->get(route('proposals.index'));
        $response->assertStatus(200);

        $response->assertInertia(function (Assert $assert) {
            $assert->component('Proposals/Index');
            $assert->has('proposals.data');
            $assert->has('proposals.links');
            $assert->where('proposals.per_page', 36);
            $assert->where('proposals.current_page', 1);
            $assert->has('proposals.total');
            $assert->where('proposals.last_page', 2); // 50 items with 36 per page = 2 pages
            $assert->has('proposals.next_page_url');
            $assert->where('proposals.prev_page_url', null);
        });
        
        // Configure mock for second page
        $this->setupMockPagination('proposal', $proposals->slice(36, 14)->toArray(), 50, 36, 2);
        
        // Test second page
        $response = $this->get(route('proposals.index', ['p' => 2]));
        $response->assertStatus(200);

        $response->assertInertia(function (Assert $assert) {
            $assert->component('Proposals/Index');
            $assert->has('proposals.data');
            $assert->has('proposals.links');
            $assert->where('proposals.current_page', 2);
            $assert->where('proposals.last_page', 2);
            $assert->has('proposals.prev_page_url');
            $assert->where('proposals.next_page_url', null);
        });
    }

    /**
     * Test pagination with custom page size for proposals
     */
    public function test_proposals_index_with_custom_page_size(): void
    {
        // Create test data
        $fund = Fund::factory()->create();
        $campaign = Campaign::factory()->for($fund, 'fund')->create();
        $proposals = Proposal::factory()->count(30)->state([
            'campaign_id' => $campaign->id,
            'fund_id' => $fund->id,
        ])->create();
        
        // Configure mock for custom page size
        $this->setupMockPagination('proposal', $proposals->take(10)->toArray(), 30, 10);

        // Request with custom page size
        $response = $this->get(route('proposals.index', ['l' => 10]));
        $response->assertStatus(200);

        $response->assertInertia(function (Assert $assert) {
            $assert->component('Proposals/Index');
            $assert->where('proposals.per_page', 10);
            $assert->where('proposals.current_page', 1);
            $assert->where('proposals.last_page', 3); // 30 items with 10 per page = 3 pages
            $assert->has('proposals.next_page_url');
            $assert->where('proposals.prev_page_url', null);
        });
    }

    /**
     * Test pagination with filtering by status for proposals
     */
    public function test_proposals_index_with_filters_and_pagination(): void
    {
        // Create test data with different statuses
        $fund = Fund::factory()->create();
        $campaign = Campaign::factory()->for($fund, 'fund')->create();
        
        // Create 15 approved proposals
        $approvedProposals = Proposal::factory()->count(15)->state([
            'campaign_id' => $campaign->id,
            'fund_id' => $fund->id,
            'status' => 'approved',
        ])->create();
        
        // Create 10 rejected proposals
        Proposal::factory()->count(10)->state([
            'campaign_id' => $campaign->id,
            'fund_id' => $fund->id,
            'status' => 'rejected',
        ])->create();
        
        // Configure mock to return only approved proposals
        $this->setupMockPagination(
            'proposal', 
            $approvedProposals->take(10)->toArray(), 
            15, 
            10, 
            1, 
            ['status' => ['approved']], 
            ['status' => ['approved' => 15, 'rejected' => 0]]
        );

        // Request with filter and pagination parameters
        $response = $this->get(route('proposals.index', [
            'ps' => ['approved'],  // project_status param
            'l' => 10              // limit param
        ]));
        $response->assertStatus(200);

        $response->assertInertia(function (Assert $assert) {
            $assert->component('Proposals/Index');
            $assert->where('proposals.per_page', 10);
            $assert->where('proposals.current_page', 1);
            $assert->where('proposals.last_page', 2); // 15 items with 10 per page = 2 pages
            $assert->has('proposals.data');
            $assert->has('proposals.next_page_url');
            $assert->where('proposals.prev_page_url', null);
        });
    }

    /**
     * Test pagination with default settings and exactly one page of results for proposals
     */
    public function test_proposals_pagination_default_settings(): void
    {
        // Create exactly one page worth of proposals (36)
        $fund = Fund::factory()->create();
        $campaign = Campaign::factory()->for($fund, 'fund')->create();
        $proposals = Proposal::factory()->count(36)->state([
            'campaign_id' => $campaign->id,
            'fund_id' => $fund->id,
        ])->create();
        
        // Configure mock to return exactly one page
        $this->setupMockPagination('proposal', $proposals->toArray(), 36, 36, 1);

        $response = $this->get(route('proposals.index'));
        $response->assertStatus(200);

        $response->assertInertia(function (Assert $assert) {
            $assert->component('Proposals/Index');
            $assert->has('proposals.data');
            $assert->where('proposals.per_page', 36);
            $assert->where('proposals.current_page', 1);
            $assert->where('proposals.last_page', 1);
            $assert->where('proposals.total', 36);
            // Should not have pagination navigation links since there's only one page
            $assert->where('proposals.next_page_url', null);
            $assert->where('proposals.prev_page_url', null);
        });
    }
    
    /**
     * Test basic pagination for groups index
     */
    public function test_groups_index_shows_pagination(): void
    {
        $this->withoutExceptionHandling();
        
        // Create test data
        $groups = Group::factory()->count(50)->create();
        
        // Configure mock for first page
        $this->setupMockPagination('group', $groups->take(36)->toArray(), 50);
        
        // Test first page
        $response = $this->get(route('groups.index'));
        $response->assertStatus(200);

        $response->assertInertia(function (Assert $assert) {
            $assert->component('Groups/Index');
            $assert->has('groups.data');
            $assert->has('groups.links');
            $assert->where('groups.per_page', 36);
            $assert->where('groups.current_page', 1);
            $assert->where('groups.total', 50);
            $assert->where('groups.last_page', 2); // 50 items with 36 per page = 2 pages
            $assert->has('groups.next_page_url');
            $assert->where('groups.prev_page_url', null);
        });
        
        // Configure mock for second page
        $this->setupMockPagination('group', $groups->slice(36, 14)->toArray(), 50, 36, 2);
        
        // Test second page
        $response = $this->get(route('groups.index', ['p' => 2]));
        $response->assertStatus(200);

        $response->assertInertia(function (Assert $assert) {
            $assert->component('Groups/Index');
            $assert->has('groups.data');
            $assert->where('groups.current_page', 2);
            $assert->where('groups.last_page', 2);
            $assert->has('groups.prev_page_url');
            $assert->where('groups.next_page_url', null);
        });
    }
    
    /**
     * Test pagination with custom page size for groups
     */
    public function test_groups_index_with_custom_page_size(): void
    {
        // Create test data
        $groups = Group::factory()->count(30)->create();
        
        // Configure mock for custom page size
        $this->setupMockPagination('group', $groups->take(10)->toArray(), 30, 10);

        // Request with custom page size
        $response = $this->get(route('groups.index', ['l' => 10]));
        $response->assertStatus(200);

        $response->assertInertia(function (Assert $assert) {
            $assert->component('Groups/Index');
            $assert->where('groups.per_page', 10);
            $assert->where('groups.current_page', 1);
            $assert->where('groups.last_page', 3); // 30 items with 10 per page = 3 pages
            $assert->has('groups.next_page_url');
            $assert->where('groups.prev_page_url', null);
        });
    }
    
    /**
     * Test pagination with exactly one page of results for groups
     */
    public function test_groups_pagination_single_page(): void
    {
        // Create exactly one page worth of groups (36)
        $groups = Group::factory()->count(36)->create();
        
        // Configure mock to return exactly one page
        $this->setupMockPagination('group', $groups->toArray(), 36, 36, 1);

        $response = $this->get(route('groups.index'));
        $response->assertStatus(200);

        $response->assertInertia(function (Assert $assert) {
            $assert->component('Groups/Index');
            $assert->has('groups.data');
            $assert->where('groups.per_page', 36);
            $assert->where('groups.current_page', 1);
            $assert->where('groups.last_page', 1); 
            $assert->where('groups.total', 36);
            // Should not have pagination navigation links since there's only one page
            $assert->where('groups.next_page_url', null);
            $assert->where('groups.prev_page_url', null);
        });
    }
    
    /**
     * Test basic pagination for ideascale profiles index
     */
    public function test_ideascale_profiles_index_shows_pagination(): void
    {
        $this->withoutExceptionHandling();
        
        // Create test data
        $profiles = IdeascaleProfile::factory()->count(50)->create();
        
        // Configure mock for first page - default page size for ideascale profiles is 40
        $this->setupMockPagination('ideascaleProfile', $profiles->take(40)->toArray(), 50, 40);
        
        // Test first page
        $response = $this->get(route('ideascaleProfiles.index'));
        $response->assertStatus(200);

        $response->assertInertia(function (Assert $assert) {
            $assert->component('IdeascaleProfile/Index');
            $assert->has('ideascaleProfiles.data');
            $assert->has('ideascaleProfiles.links');
            $assert->where('ideascaleProfiles.per_page', 40);
            $assert->where('ideascaleProfiles.current_page', 1);
            $assert->where('ideascaleProfiles.total', 50);
            $assert->where('ideascaleProfiles.last_page', 2); // 50 items with 40 per page = 2 pages
            $assert->has('ideascaleProfiles.next_page_url');
            $assert->where('ideascaleProfiles.prev_page_url', null);
        });
        
        // Configure mock for second page
        $this->setupMockPagination('ideascaleProfile', $profiles->slice(40, 10)->toArray(), 50, 40, 2);
        
        // Test second page
        $response = $this->get(route('ideascaleProfiles.index', ['p' => 2]));
        $response->assertStatus(200);

        $response->assertInertia(function (Assert $assert) {
            $assert->component('IdeascaleProfile/Index');
            $assert->has('ideascaleProfiles.data');
            $assert->where('ideascaleProfiles.current_page', 2);
            $assert->where('ideascaleProfiles.last_page', 2);
            $assert->has('ideascaleProfiles.prev_page_url');
            $assert->where('ideascaleProfiles.next_page_url', null);
        });
    }
    
    /**
     * Test pagination with custom page size for ideascale profiles
     */
    public function test_ideascale_profiles_with_custom_page_size(): void
    {
        // Create test data
        $profiles = IdeascaleProfile::factory()->count(30)->create();
        
        // Configure mock for custom page size
        $this->setupMockPagination('ideascaleProfile', $profiles->take(10)->toArray(), 30, 10);

        // Request with custom page size
        $response = $this->get(route('ideascaleProfiles.index', ['l' => 10]));
        $response->assertStatus(200);

        $response->assertInertia(function (Assert $assert) {
            $assert->component('IdeascaleProfile/Index');
            $assert->where('ideascaleProfiles.per_page', 10);
            $assert->where('ideascaleProfiles.current_page', 1);
            $assert->where('ideascaleProfiles.last_page', 3); // 30 items with 10 per page = 3 pages
            $assert->has('ideascaleProfiles.next_page_url');
            $assert->where('ideascaleProfiles.prev_page_url', null);
        });
    }
    
    /**
     * Test pagination with empty results for ideascale profiles
     */
    public function test_ideascale_profiles_with_empty_results(): void
    {
        // Configure mock to return empty results
        $this->setupMockPagination('ideascaleProfile', [], 0, 40, 1);

        $response = $this->get(route('ideascaleProfiles.index'));
        $response->assertStatus(200);

        $response->assertInertia(function (Assert $assert) {
            $assert->component('IdeascaleProfile/Index');
            $assert->has('ideascaleProfiles.data', function ($data) {
                return count($data) === 0;
            });
            $assert->where('ideascaleProfiles.total', 0);
            $assert->where('ideascaleProfiles.per_page', 40);
            $assert->where('ideascaleProfiles.current_page', 1);
            $assert->where('ideascaleProfiles.last_page', 1);
            $assert->where('ideascaleProfiles.next_page_url', null);
            $assert->where('ideascaleProfiles.prev_page_url', null);
        });
    }
}