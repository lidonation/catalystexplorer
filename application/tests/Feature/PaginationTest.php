<?php

namespace Tests\Feature;

use App\Models\Campaign;
use App\Models\Fund;
use App\Models\Group;
use App\Models\IdeascaleProfile;
use App\Models\Proposal;
use App\Models\User;
use App\Models\Review;
use App\Repositories\GroupRepository;
use App\Repositories\ReviewRepository;
use App\Repositories\IdeascaleProfileRepository;
use App\Repositories\TransactionRepository;
use App\Repositories\ProposalRepository;
use App\Repositories\VoterHistoryRepository;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Mockery;
use PHPUnit\Framework\Attributes\DataProvider;
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

    /**
     * @var \Mockery\MockInterface
     */
    protected $transactionRepository;

    /**
     * @var \Mockery\MockInterface
     */
    protected $reviewRepository;

    /**
     * @var \Mockery\MockInterface
     */
    protected $voterHistoryRepository;

    public function setUp(): void
    {
        parent::setUp();

        $this->app['env'] = 'testing';
        config(['app.env' => 'testing']);

        $this->user = User::factory()->create();

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
        foreach (
            [
                ProposalRepository::class      => 'proposalRepository',
                GroupRepository::class         => 'groupRepository',
                IdeascaleProfileRepository::class => 'ideascaleProfileRepository',
                TransactionRepository::class   => 'transactionRepository',
                ReviewRepository::class        => 'reviewRepository',
                VoterHistoryRepository::class  => 'voterHistoryRepository',
            ] as $class => $prop
        ) {
            // create a PHPUnit mock instead of Mockery::mock()
            $this->$prop = $this->createMock($class);
            $this->app->instance($class, $this->$prop);
        }
    }

    protected function setupMockPagination(
        string $repository,
        array $items,
        int $totalCount,
        int $perPage = 36,
        int $page = 1,
        array $filters = [],
        array $facetDistribution = []
    ): void {
        $rawResponse = [
            'hits'               => $items,
            'estimatedTotalHits' => $totalCount,
            'facetDistribution'  => $facetDistribution ?: [
                'status'         => ['approved' => 15, 'rejected' => 10],
                'funding_status' => ['funded' => 25],
            ],
            'facetStats'         => [],
        ];

        // use PHPUnit mock for the Scout Builder instead of Mockery
        $builder = $this->createMock(\Laravel\Scout\Builder::class);
        $builder->method('raw')->willReturn($rawResponse);

        $repoProp = "{$repository}Repository";

        $this->$repoProp
            ->expects($this->any())
            ->method('search')
            ->withAnyParameters()
            ->willReturn($builder);
    }

    /**
     * Provides test data for pagination tests
     * @return array
     */
    public static function paginationTestDataProvider(): array
    {
        return [
            'proposals' => [
                'repository' => 'proposal',
                'route' => 'proposals.index',
                'component' => 'Proposals/Index',
                'propName' => 'proposals',
                'perPage' => 24,
                'factory' => fn() => Proposal::factory(),
                'modelData' => ['campaign_id' => fn() => Campaign::factory()->create()->id, 'fund_id' => fn() => Fund::factory()->create()->id],
            ],
            'groups' => [
                'repository' => 'group',
                'route' => 'groups.index',
                'component' => 'Groups/Index',
                'propName' => 'groups',
                'perPage' => 36,
                'factory' => fn() => Group::factory(),
                'modelData' => [],
            ],
            'ideascaleProfiles' => [
                'repository' => 'ideascaleProfile',
                'route' => 'ideascaleProfiles.index',
                'component' => 'IdeascaleProfile/Index',
                'propName' => 'ideascaleProfiles',
                'perPage' => 24,
                'factory' => fn() => IdeascaleProfile::factory(),
                'modelData' => [],
            ],
            'reviews' => [
                'repository' => 'review',
                'route' => 'reviews.index',
                'component' => 'Reviews/Index',
                'propName' => 'reviews',
                'perPage' => 24,
                'factory' => fn() => Review::factory(),
                'modelData' => [],
            ],
            'voterHistories' => [
                'repository' => 'voterHistory',
                'route' => 'votes.index',
                'component' => 'Votes/Index',
                'propName' => 'voterHistories',
                'perPage' => 10,
                'factory' => null, // Special case that needs custom handling
                'modelData' => [],
            ],
            'transactions' => [
                'repository' => 'transaction',
                'route' => 'jormungandr.transactions.index',
                'component' => 'Transactions/Index',
                'propName' => 'transactions',
                'perPage' => 24,
                'factory' => null, 
                'modelData' => [],
            ],
        ];
    }

    #[DataProvider('paginationTestDataProvider')]
    public function test_entity_index_shows_pagination(
        string $repository,
        string $route,
        string $component,
        string $propName,
        int $perPage,
        $factory,
        array $modelData
    ): void {
        $this->withoutExceptionHandling();

        $items = $this->createTestItems($repository, $factory, $modelData, 50);

        // Test first page
        $this->setupMockPagination($repository, array_slice($items, 0, $perPage), 50, $perPage);

        $response = $this->get(route($route));
        
        $response->assertStatus(200);

        $this->assertPaginationProps($response, $component, $propName, [
            'total' => 50,
            'per_page' => $perPage,
            'current_page' => 1,
            'last_page' => (int)ceil(50 / $perPage),
            'next_page_url' => true,
            'prev_page_url' => null
        ]);

        // Test second page
        $this->setupMockPagination(
            $repository,
            array_slice($items, $perPage, $perPage),
            50,
            $perPage,
            2
        );

        $response = $this->get(route($route, ['p' => 2]));
        $response->assertStatus(200);

        $this->assertPaginationProps($response, $component, $propName, [
            'current_page' => 2,
            'last_page' => (int)ceil(50 / $perPage), // Cast to integer
            'prev_page_url' => true,
            'next_page_url' => 2 < ceil(50 / $perPage) ? true : null
        ]);
    }

    #[DataProvider('paginationTestDataProvider')]
    public function test_entity_index_with_custom_page_size(
        string $repository,
        string $route,
        string $component,
        string $propName,
        int $perPage,
        $factory,
        array $modelData
    ): void {
        $customPerPage = 10;
        $items = $this->createTestItems($repository, $factory, $modelData, 30);

        $this->setupMockPagination($repository, array_slice($items, 0, $customPerPage), 30, $customPerPage);

        $response = $this->get(route($route, ['l' => $customPerPage]));
        $response->assertStatus(200);

        $this->assertPaginationProps($response, $component, $propName, [
            'per_page' => $customPerPage,
            'current_page' => 1,
            'last_page' => (int)3,
            'next_page_url' => true,
            'prev_page_url' => null
        ]);
    }

    #[DataProvider('paginationTestDataProvider')]
    public function test_entity_pagination_single_page(
        string $repository,
        string $route,
        string $component,
        string $propName,
        int $perPage,
        $factory,
        array $modelData
    ): void {
        $items = $this->createTestItems($repository, $factory, $modelData, $perPage);

        $this->setupMockPagination($repository, $items, $perPage, $perPage, 1);

        $response = $this->get(route($route));
        $response->assertStatus(200);

        $this->assertPaginationProps($response, $component, $propName, [
            'per_page' => $perPage,
            'current_page' => 1,
            'last_page' => 1,
            'total' => $perPage,
            'next_page_url' => null,
            'prev_page_url' => null
        ]);
    }

    #[DataProvider('paginationTestDataProvider')]
    public function test_entity_with_empty_results(
        string $repository,
        string $route,
        string $component,
        string $propName,
        int $perPage,
        $factory,
        array $modelData
    ): void {
        $this->setupMockPagination($repository, [], 0, $perPage, 1);

        $response = $this->get(route($route));
        $response->assertStatus(200);

        $this->assertPaginationProps($response, $component, $propName, [
            'total' => 0,
            'per_page' => $perPage,
            'current_page' => 1,
            'last_page' => 1,
            'next_page_url' => null,
            'prev_page_url' => null
        ]);
    }

    /**
     * Test filtering functionality for proposals
     * This test is specific to proposals and can't be generalized
     */
    public function test_proposals_index_with_filters_and_pagination(): void
    {
        $fund = Fund::factory()->create();
        $campaign = Campaign::factory()->for($fund, 'fund')->create();

        $approvedProposals = Proposal::factory()->count(15)->state([
            'campaign_id' => $campaign->id,
            'fund_id' => $fund->id,
            'status' => 'approved',
        ])->create();

        Proposal::factory()->count(10)->state([
            'campaign_id' => $campaign->id,
            'fund_id' => $fund->id,
            'status' => 'rejected',
        ])->create();

        $this->setupMockPagination(
            'proposal',
            $approvedProposals->take(10)->toArray(),
            15,
            10,
            1,
            ['status' => ['approved']],
            ['status' => ['approved' => 15, 'rejected' => 0]]
        );

        $response = $this->get(route('proposals.index', [
            'ps' => ['approved'],
            'l' => 10
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
     * Helper method to assert pagination props
     */
    protected function assertPaginationProps($response, string $component, string $propName, array $expectedProps): void
    {
        $response->assertInertia(function (Assert $assert) use ($component, $propName, $expectedProps) {
            $assert->component($component);

            if (!isset($expectedProps['has_data']) || $expectedProps['has_data']) {
                $assert->has("$propName.data");
            }

            if (!isset($expectedProps['has_links']) || $expectedProps['has_links']) {
                $assert->has("$propName.links");
            }

            foreach ($expectedProps as $prop => $value) {
                if (in_array($prop, ['has_data', 'has_links'])) continue;

                if ($prop === 'next_page_url' && $value === true) {
                    $assert->has("$propName.next_page_url");
                } else if ($prop === 'prev_page_url' && $value === true) {
                    $assert->has("$propName.prev_page_url");
                } else {
                    $assert->where("$propName.$prop", $value);
                }
            }
        });
    }

    /**
     * Helper method to create test items for different entities
     */
    protected function createTestItems(string $repository, $factory, array $modelData, int $count): array
    {
        if ($repository === 'voterHistory') {
            return $this->createVoterHistoryItems($count);
        } else if ($repository === 'transaction') {
            return $this->createTransactionItems($count);
        } else if ($factory) {
            $query = $factory();
            if (!empty($modelData)) {
                $resolvedData = [];
                foreach ($modelData as $key => $value) {
                    $resolvedData[$key] = is_callable($value) ? $value() : $value;
                }
                $query = $query->state($resolvedData);
            }
            return $query->count($count)->create()->toArray();
        }

        return [];
    }

    /**
     * Create voter history test items
     */
    protected function createVoterHistoryItems(int $count): array
    {
        return collect(range(1, $count))->map(function ($i) {
            return [
                'id' => $i,
                'stake_address' => "stake1" . substr(hash('sha256', "address{$i}"), 0, 54),
                'fragment_id' => "fragment{$i}",
                'caster' => (string) (100000000 + $i),
                'time' => now()->subHours($i)->format('Y-m-d\TH:i:s.v\Z'),
                'raw_fragment' => json_encode([
                    'signature' => hash('sha256', "signature{$i}"),
                    'vote_data' => [
                        'proposal_id' => $i * 100,
                        'choice' => $i % 3,
                        'timestamp' => now()->subHours($i)->timestamp
                    ]
                ]),
                'choice' => $i % 3,
                'voting_power' => $i * 1000,
                'hash' => strtolower(hash('sha256', "transaction{$i}"))
            ];
        })->all();
    }

    /**
     * Create transaction test items
     */
    protected function createTransactionItems(int $count): array
    {
        return collect(range(1, $count))->map(function ($i) {
            return [
                'hash' => "hash{$i}",
                'tx_hash' => "tx_hash{$i}",
                'block' => "block{$i}",
                'epoch' => $i,
                'json_metadata' => null,
                'raw_metadata' => null,
                'created_at' => now()->toISOString(),
                'inputs' => [],
                'outputs' => [],
            ];
        })->all();
    }
}
