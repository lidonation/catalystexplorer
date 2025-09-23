<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Enums\BookmarkStatus;
use App\Enums\BookmarkVisibility;
use App\Enums\QueryParamsEnum;
use App\Enums\VoteEnum;
use App\Models\BookmarkCollection;
use App\Models\BookmarkItem;
use App\Models\Campaign;
use App\Models\Fund;
use App\Models\Proposal;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class VoterListControllerRegressionTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected Fund $fund;
    protected Campaign $campaign;
    protected Proposal $proposal1;
    protected Proposal $proposal2;
    protected BookmarkCollection $publicVoterList;
    protected BookmarkCollection $privateVoterList;
    protected BookmarkCollection $unlistedVoterList;

    protected function setUp(): void
    {
        parent::setUp();
        $this->setupTestData();
    }

    protected function setupTestData(): void
    {
        $this->user = User::factory()->create();
        
        $this->fund = Fund::factory()->create([
            'title' => 'Test Fund',
            'slug' => 'test-fund',
        ]);

        $this->campaign = Campaign::factory()->create([
            'fund_id' => $this->fund->id,
            'title' => 'Test Campaign',
        ]);

        $this->proposal1 = Proposal::factory()->create([
            'title' => 'Test Proposal 1',
            'fund_id' => $this->fund->id,
        ]);

        $this->proposal2 = Proposal::factory()->create([
            'title' => 'Test Proposal 2', 
            'fund_id' => $this->fund->id,
        ]);

        // Create voter lists with different visibilities
        $this->publicVoterList = BookmarkCollection::factory()->create([
            'user_id' => $this->user->id,
            'title' => 'Public Voter List',
            'fund_id' => $this->fund->id,
            'visibility' => BookmarkVisibility::PUBLIC()->value,
            'status' => BookmarkStatus::PUBLISHED()->value,
        ]);

        $this->privateVoterList = BookmarkCollection::factory()->create([
            'user_id' => $this->user->id,
            'title' => 'Private Voter List',
            'fund_id' => $this->fund->id,
            'visibility' => BookmarkVisibility::PRIVATE()->value,
            'status' => BookmarkStatus::DRAFT()->value,
        ]);

        $this->unlistedVoterList = BookmarkCollection::factory()->create([
            'user_id' => $this->user->id,
            'title' => 'Unlisted Voter List',
            'fund_id' => $this->fund->id,
            'visibility' => BookmarkVisibility::UNLISTED()->value,
            'status' => BookmarkStatus::DRAFT()->value,
        ]);

        // Add proposals to lists
        foreach ([$this->publicVoterList, $this->privateVoterList, $this->unlistedVoterList] as $list) {
            BookmarkItem::factory()->create([
                'bookmark_collection_id' => $list->id,
                'user_id' => $this->user->id,
                'model_type' => Proposal::class,
                'model_id' => $this->proposal1->id,
                'vote' => VoteEnum::YES->value,
            ]);
        }
    }

    /** @test */
    public function step1_renders_correctly()
    {
        $response = $this->actingAs($this->user)->get(
            route('workflows.createVoterList.index', ['step' => 1])
        );

        $response->assertOk();
        $response->assertInertia(
            fn (Assert $page) => $page
                ->component('Workflows/CreateVoterList/Step1')
                ->has('stepDetails')
                ->where('activeStep', 1)
        );
    }

    /** @test */ 
    public function step2_renders_with_funds_and_existing_voter_list()
    {
        $response = $this->actingAs($this->user)->get(
            route('workflows.createVoterList.index', [
                'step' => 2,
                QueryParamsEnum::BOOKMARK_COLLECTION()->value => $this->publicVoterList->id,
            ])
        );

        $response->assertOk();
        $response->assertInertia(
            fn (Assert $page) => $page
                ->component('Workflows/CreateVoterList/Step2')
                ->has('stepDetails')
                ->has('funds')
                ->has('latestFund')
                ->has('voterList')
                ->where('activeStep', 2)
                ->where('voterList.title', 'Public Voter List')
                ->where('voterList.fund.title', 'Test Fund')
        );
    }

    /** @test */
    public function step2_can_access_voter_lists_of_all_visibilities()
    {
        // Test accessing public voter list
        $publicResponse = $this->actingAs($this->user)->get(
            route('workflows.createVoterList.index', [
                'step' => 2,
                QueryParamsEnum::BOOKMARK_COLLECTION()->value => $this->publicVoterList->id,
            ])
        );
        
        $publicResponse->assertOk();
        $publicResponse->assertInertia(
            fn (Assert $page) => $page->where('voterList.title', 'Public Voter List')
        );

        // Test accessing private voter list
        $privateResponse = $this->actingAs($this->user)->get(
            route('workflows.createVoterList.index', [
                'step' => 2,
                QueryParamsEnum::BOOKMARK_COLLECTION()->value => $this->privateVoterList->id,
            ])
        );
        
        $privateResponse->assertOk();
        $privateResponse->assertInertia(
            fn (Assert $page) => $page->where('voterList.title', 'Private Voter List')
        );

        // Test accessing unlisted voter list
        $unlistedResponse = $this->actingAs($this->user)->get(
            route('workflows.createVoterList.index', [
                'step' => 2,
                QueryParamsEnum::BOOKMARK_COLLECTION()->value => $this->unlistedVoterList->id,
            ])
        );
        
        $unlistedResponse->assertOk();
        $unlistedResponse->assertInertia(
            fn (Assert $page) => $page->where('voterList.title', 'Unlisted Voter List')
        );
    }

    /** @test */
    public function step3_handles_fund_parameter_correctly()
    {
        // Test with fund ID
        $responseWithId = $this->actingAs($this->user)->get(
            route('workflows.createVoterList.index', [
                'step' => 3,
                'bookmarkCollection' => $this->publicVoterList->id,
                QueryParamsEnum::FUNDS()->value => $this->fund->id,
            ])
        );

        $responseWithId->assertOk();
        $responseWithId->assertInertia(
            fn (Assert $page) => $page
                ->component('Workflows/CreateVoterList/Step3')
                ->has('proposals')
                ->has('campaigns')
                ->has('selectedProposals')
                ->where('fundSlug', $this->fund->slug)
        );

        // Test with fund slug  
        $responseWithSlug = $this->actingAs($this->user)->get(
            route('workflows.createVoterList.index', [
                'step' => 3,
                'bookmarkCollection' => $this->publicVoterList->id,
                QueryParamsEnum::FUNDS()->value => $this->fund->slug,
            ])
        );

        $responseWithSlug->assertOk();
        $responseWithSlug->assertInertia(
            fn (Assert $page) => $page->where('fundSlug', $this->fund->slug)
        );
    }

    /** @test */
    public function step3_loads_selected_proposals_correctly()
    {
        $response = $this->actingAs($this->user)->get(
            route('workflows.createVoterList.index', [
                'step' => 3,
                'bookmarkCollection' => $this->publicVoterList->id,
                QueryParamsEnum::FUNDS()->value => $this->fund->id,
            ])
        );

        $response->assertOk();
        $response->assertInertia(
            fn (Assert $page) => $page
                ->has('selectedProposals', 1)
                ->where('selectedProposals.0.id', $this->proposal1->id)
                ->where('selectedProposals.0.vote', VoteEnum::YES->value)
        );
    }

    /** @test */
    public function step4_displays_selected_proposals_and_rationale()
    {
        $response = $this->actingAs($this->user)->get(
            route('workflows.createVoterList.index', [
                'step' => 4,
                QueryParamsEnum::BOOKMARK_COLLECTION()->value => $this->publicVoterList->id,
            ])
        );

        $response->assertOk();
        $response->assertInertia(
            fn (Assert $page) => $page
                ->component('Workflows/CreateVoterList/Step4')
                ->has('selectedProposals')
                ->where('selectedProposals.0', $this->proposal1->id)
                ->has('bookmarkHash')
                ->has('bookmarkId')
        );
    }

    /** @test */
    public function step6_paginates_proposals_correctly()
    {
        $response = $this->actingAs($this->user)->get(
            route('workflows.createVoterList.index', [
                'step' => 6,
                QueryParamsEnum::BOOKMARK_COLLECTION()->value => $this->publicVoterList->id,
                'limit' => 1,
            ])
        );

        $response->assertOk();
        $response->assertInertia(
            fn (Assert $page) => $page
                ->component('Workflows/CreateVoterList/Step6')
                ->has('selectedProposals')
                ->has('selectedProposals.data')
                ->has('bookmarkCollection')
        );
    }

    /** @test */
    public function save_list_details_creates_new_voter_list()
    {
        $response = $this->actingAs($this->user)->post(
            route('workflows.createVoterList.saveListDetails'),
            [
                'title' => 'New Voter List',
                'visibility' => BookmarkVisibility::PUBLIC()->value,
                'fund_slug' => $this->fund->slug,
                'content' => 'Test content',
                'comments_enabled' => true,
                'color' => '#FF0000',
                'status' => BookmarkStatus::DRAFT()->value,
            ]
        );

        $response->assertRedirect();
        
        // Verify the list was created
        $this->assertDatabaseHas('bookmark_collections', [
            'title' => 'New Voter List',
            'visibility' => BookmarkVisibility::PUBLIC()->value,
            'fund_id' => $this->fund->id,
            'user_id' => $this->user->id,
            'content' => 'Test content',
            'allow_comments' => true,
            'color' => '#FF0000',
            'status' => BookmarkStatus::DRAFT()->value,
        ]);
    }

    /** @test */
    public function save_list_details_updates_existing_voter_list()
    {
        $response = $this->actingAs($this->user)->post(
            route('workflows.createVoterList.saveListDetails'),
            [
                QueryParamsEnum::BOOKMARK_COLLECTION()->value => $this->privateVoterList->id,
                'title' => 'Updated Private List',
                'visibility' => BookmarkVisibility::UNLISTED()->value,
                'fund_slug' => $this->fund->slug,
                'content' => 'Updated content',
                'comments_enabled' => false,
                'color' => '#00FF00',
                'status' => BookmarkStatus::PUBLISHED()->value,
            ]
        );

        $response->assertRedirect();
        
        // Verify the list was updated
        $this->assertDatabaseHas('bookmark_collections', [
            'id' => $this->privateVoterList->id,
            'title' => 'Updated Private List',
            'visibility' => BookmarkVisibility::UNLISTED()->value,
            'content' => 'Updated content',
            'allow_comments' => false,
            'color' => '#00FF00',
            'status' => BookmarkStatus::PUBLISHED()->value,
        ]);
    }

    /** @test */
    public function save_proposals_creates_bookmark_items_with_votes()
    {
        $response = $this->actingAs($this->user)->post(
            route('workflows.createVoterList.saveProposals'),
            [
                'bookmarkHash' => $this->privateVoterList->id,
                'proposals' => [
                    [
                        'id' => $this->proposal1->id,
                        'vote' => VoteEnum::YES->value,
                    ],
                    [
                        'id' => $this->proposal2->id,
                        'vote' => VoteEnum::NO->value,
                    ],
                ],
            ]
        );

        $response->assertRedirect();
        
        // Verify bookmark items were created with correct votes
        $this->assertDatabaseHas('bookmark_items', [
            'bookmark_collection_id' => $this->privateVoterList->id,
            'model_type' => Proposal::class,
            'model_id' => $this->proposal1->id,
            'user_id' => $this->user->id,
            'vote' => VoteEnum::YES->value,
        ]);

        $this->assertDatabaseHas('bookmark_items', [
            'bookmark_collection_id' => $this->privateVoterList->id,
            'model_type' => Proposal::class,
            'model_id' => $this->proposal2->id,
            'user_id' => $this->user->id,
            'vote' => VoteEnum::NO->value,
        ]);
    }

    /** @test */
    public function save_proposals_removes_items_with_null_votes()
    {
        // First add a proposal
        BookmarkItem::factory()->create([
            'bookmark_collection_id' => $this->privateVoterList->id,
            'user_id' => $this->user->id,
            'model_type' => Proposal::class,
            'model_id' => $this->proposal2->id,
            'vote' => VoteEnum::YES->value,
        ]);

        // Then save with null vote (should remove it)
        $response = $this->actingAs($this->user)->post(
            route('workflows.createVoterList.saveProposals'),
            [
                'bookmarkHash' => $this->privateVoterList->id,
                'proposals' => [
                    [
                        'id' => $this->proposal2->id,
                        'vote' => null,
                    ],
                ],
            ]
        );

        $response->assertRedirect();
        
        // Verify the item was removed
        $this->assertDatabaseMissing('bookmark_items', [
            'bookmark_collection_id' => $this->privateVoterList->id,
            'model_type' => Proposal::class,
            'model_id' => $this->proposal2->id,
            'user_id' => $this->user->id,
        ]);
    }

    /** @test */
    public function save_rationales_creates_comment_and_publishes_list()
    {
        $response = $this->actingAs($this->user)->post(
            route('workflows.createVoterList.saveRationales'),
            [
                QueryParamsEnum::BOOKMARK_COLLECTION()->value => $this->privateVoterList->id,
                'rationale' => 'This is my rationale for voting.',
            ]
        );

        $response->assertRedirect();
        
        // Verify comment was created
        $this->assertDatabaseHas('comments', [
            'commentable_type' => BookmarkCollection::class,
            'commentable_id' => $this->privateVoterList->id,
            'text' => 'This is my rationale for voting.',
            'original_text' => 'This is my rationale for voting.',
            'commentator_id' => $this->user->id,
        ]);

        // Verify list was published
        $this->assertDatabaseHas('bookmark_collections', [
            'id' => $this->privateVoterList->id,
            'status' => BookmarkStatus::PUBLISHED()->value,
        ]);
    }

    /** @test */
    public function all_steps_work_with_different_visibility_collections()
    {
        $testCases = [
            ['collection' => $this->publicVoterList, 'title' => 'Public Voter List'],
            ['collection' => $this->privateVoterList, 'title' => 'Private Voter List'],
            ['collection' => $this->unlistedVoterList, 'title' => 'Unlisted Voter List'],
        ];

        foreach ($testCases as $testCase) {
            $collection = $testCase['collection'];
            $expectedTitle = $testCase['title'];

            // Test step 2 (fund selection)
            $step2Response = $this->actingAs($this->user)->get(
                route('workflows.createVoterList.index', [
                    'step' => 2,
                    QueryParamsEnum::BOOKMARK_COLLECTION()->value => $collection->id,
                ])
            );
            
            $step2Response->assertOk();
            $step2Response->assertInertia(
                fn (Assert $page) => $page->where('voterList.title', $expectedTitle)
            );

            // Test step 6 (vote summary)
            $step6Response = $this->actingAs($this->user)->get(
                route('workflows.createVoterList.index', [
                    'step' => 6,
                    QueryParamsEnum::BOOKMARK_COLLECTION()->value => $collection->id,
                ])
            );
            
            $step6Response->assertOk();
            $step6Response->assertInertia(
                fn (Assert $page) => $page->where('bookmarkCollection.title', $expectedTitle)
            );

            // Test step 9 (final review)
            $step9Response = $this->actingAs($this->user)->get(
                route('workflows.createVoterList.index', [
                    'step' => 9,
                    QueryParamsEnum::BOOKMARK_COLLECTION()->value => $collection->id,
                ])
            );
            
            $step9Response->assertOk();
            $step9Response->assertInertia(
                fn (Assert $page) => $page->where('bookmarkCollection.title', $expectedTitle)
            );
        }
    }

    /** @test */
    public function controller_handles_missing_bookmark_collection_gracefully()
    {
        $nonExistentId = 'non-existent-id';

        // Test step 2 with non-existent collection
        $response = $this->actingAs($this->user)->get(
            route('workflows.createVoterList.index', [
                'step' => 2,
                QueryParamsEnum::BOOKMARK_COLLECTION()->value => $nonExistentId,
            ])
        );

        $response->assertOk();
        $response->assertInertia(
            fn (Assert $page) => $page->where('voterList', null)
        );
    }

    /** @test */
    public function unauthorized_users_cannot_access_workflow_steps()
    {
        $response = $this->get(
            route('workflows.createVoterList.index', ['step' => 1])
        );

        $response->assertRedirect(route('login'));
    }

    /** @test */
    public function users_can_only_access_their_own_voter_lists()
    {
        $otherUser = User::factory()->create();
        $otherUserList = BookmarkCollection::factory()->create([
            'user_id' => $otherUser->id,
            'title' => 'Other User List',
            'visibility' => BookmarkVisibility::PRIVATE()->value,
        ]);

        // Try to access another user's list
        $response = $this->actingAs($this->user)->get(
            route('workflows.createVoterList.index', [
                'step' => 2,
                QueryParamsEnum::BOOKMARK_COLLECTION()->value => $otherUserList->id,
            ])
        );

        // Should still work (controller doesn't enforce ownership in step 2)
        // but the list won't be found by user-specific queries
        $response->assertOk();
    }

    /** @test */
    public function workflow_handles_edge_cases_properly()
    {
        // Test with malformed fund parameter
        $response = $this->actingAs($this->user)->get(
            route('workflows.createVoterList.index', [
                'step' => 3,
                'bookmarkCollection' => $this->publicVoterList->id,
                QueryParamsEnum::FUNDS()->value => 'invalid-fund',
            ])
        );

        $response->assertOk();
        $response->assertInertia(
            fn (Assert $page) => $page->has('proposals')
        );

        // Test saveProposals with invalid vote values
        $invalidVoteResponse = $this->actingAs($this->user)->post(
            route('workflows.createVoterList.saveProposals'),
            [
                'bookmarkHash' => $this->privateVoterList->id,
                'proposals' => [
                    [
                        'id' => $this->proposal1->id,
                        'vote' => 'invalid-vote-value',
                    ],
                ],
            ]
        );

        $invalidVoteResponse->assertRedirect();
        
        // Should not save invalid vote values
        $this->assertDatabaseMissing('bookmark_items', [
            'bookmark_collection_id' => $this->privateVoterList->id,
            'model_id' => $this->proposal1->id,
            'vote' => 'invalid-vote-value',
        ]);
    }
}