<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\GroupsController;
use App\Http\Controllers\Api\TagController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\ReviewsController;
use App\Http\Controllers\Api\GroupController;
use App\Http\Controllers\ProposalsController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\CommunitiesController;
use App\Http\Controllers\Api\CampaignController;
use App\Http\Controllers\Api\ProposalController;
use App\Http\Controllers\Api\ReviewerController;
use App\Http\Controllers\Api\CommunityController;
use App\Http\Controllers\Api\FundController;
use App\Http\Controllers\Api\CatalystTallyController;
use App\Http\Controllers\My\MyBookmarksController;
use App\Http\Controllers\VoterHistoriesController;
use App\Http\Controllers\CompletedProjectNftsController;
use App\Http\Controllers\Api\IdeascaleProfilesController;
use App\Http\Controllers\CardanoBudgetProposalController;
use App\Http\Controllers\CatalystDrepController;
use App\Http\Controllers\UserLanguageController;
use Inertia\Inertia;

Route::as('api.')->group(function () {
    Route::get('/', fn() => Inertia::render(component: 'ComingSoon', props: ['context' => 'API']))->name('index');

    Route::get('/groups', [GroupController::class, 'groups'])->name('groups');
    Route::get('/groups/{group:id}', [GroupController::class, 'group'])->name('group');
    Route::get('/groups/{uuid}/connections', [GroupController::class, 'connections'])->name('groups.connections');
    Route::get('/groups/incremental-connections', [GroupController::class, 'incrementalConnections'])->name('groups.incremental-connections');
    Route::get('ideascale-profiles/incremental-connections', [IdeascaleProfilesController::class, 'incrementalConnections'])->name('ideascaleProfiles.incremental-connections');
    Route::get('/choices', [VoterHistoriesController::class, 'getChoices'])->name('choices');

    Route::get('/campaigns', [CampaignController::class, 'campaigns'])->name('campaigns');
    Route::get('/campaigns/{campaign:id}', [CampaignController::class, 'campaign'])->name('campaign');

    Route::get('/tags', [TagController::class, 'tags'])->name('tags');
    Route::get('/tags/{tag:id}', [TagController::class, 'tag'])->name('tag');

    Route::prefix('v1')->as('v1.')->group(function () {
        Route::apiResource('proposals', ProposalController::class)
            ->only(['index', 'show']);

        Route::apiResource('funds', FundController::class)
            ->only(['index', 'show']);

        // Nested resource for fund proposals
        Route::get('funds/{fund}/proposals', [FundController::class, 'proposals'])
            ->name('funds.proposals');

        // CatalystTally API routes
        Route::apiResource('catalyst-tallies', CatalystTallyController::class)
            ->only(['index', 'show']);
            
        // Additional CatalystTally endpoints
        Route::get('catalyst-tallies-funds', [CatalystTallyController::class, 'funds'])
            ->name('catalyst-tallies.funds');
        Route::get('catalyst-tallies-stats', [CatalystTallyController::class, 'stats'])
            ->name('catalyst-tallies.stats');

        // You can add other v1 resources here in the future
        // Route::apiResource('campaigns', CampaignController::class)->only(['index', 'show']);
    });

    // Legacy endpoints for backwards compatibility (unversioned)
    Route::get('/proposals', [ProposalController::class, 'proposals'])->name('proposals');
    Route::get('/funds', [FundController::class, 'funds'])->name('funds.legacy');

    Route::get('/reviewers', [ReviewerController::class, 'reviewers'])->name('reviewers');

    Route::get('/reviews', [ReviewController::class, 'reviews'])->name('reviews');

    Route::get('/links', [\App\Http\Controllers\LinksController::class, 'links'])->name('links');

    Route::get('/ideascaleProfiles', [IdeascaleProfilesController::class, 'ideascaleProfiles'])->name('ideascaleProfiles');

    Route::post('/test-modal', function () {
        return response()->json(['message' => 'OK', 'time' => now()]);
    })->name('test');

    Route::get('/communities', [CommunityController::class, 'communities'])->name('communities');
    Route::get('/communities/{community:id}', [CommunitiesController::class, 'community'])->name('community');

    Route::get('/communities/{uuid}/connections', [CommunitiesController::class, 'connections'])->name('communities.connections');
    Route::get('/communities/incremental-connections', [CommunitiesController::class, 'incrementalConnections'])->name('communities.incremental-connections');
    Route::post('/communities/{uuid}/join', [CommunitiesController::class, 'join'])->name('community.join');

    Route::get('/proposal-charts-metrics', [ProposalsController::class, 'getProposalMetrics'])
        ->name('proposalChartsMetrics');

    Route::prefix('bookmark-items')->as('bookmarks.')
        ->group(function () {
            Route::post('/{modelType}/{uuid}/{bookmarkCollection?}', [MyBookmarksController::class, 'store'])
                ->middleware(['web', 'auth'])
                ->name('store');
            Route::delete('/{bookmarkItem}', [MyBookmarksController::class, 'delete'])
                ->middleware(['web', 'auth'])
                ->name('remove');
            Route::get('/{modelType}/{uuid}/status', [MyBookmarksController::class, 'status'])
                ->name('status');
        });

    Route::prefix('collection-items')->as('collections.')
        ->middleware(['web', 'auth'])
        ->group(function () {
            Route::post('/create', [MyBookmarksController::class, 'createCollection'])
                ->name('create');
            Route::post('{bookmarkCollection}/update', [MyBookmarksController::class, 'updateCollection'])
                ->name('update');
//            Route::post('{bookmarkCollection}/delete', [MyBookmarksController::class, 'deleteCollection'])
//                ->name('delete');
            Route::get('/', [MyBookmarksController::class, 'retrieveCollections'])
                ->name('retrieve');
            Route::prefix('bookmarks')->as('bookmarks.')
                ->group(function () {
                    Route::post('/add', [MyBookmarksController::class, 'addBookmarkToCollection'])
                        ->name('add');
                    Route::post('/remove', [MyBookmarksController::class, 'removeBookmarkFromCollection'])
                        ->name('remove');
                });
        });

    Route::prefix('ideascale-profiles')->as('ideascaleProfiles.')->group(function () {
        Route::get('/', [IdeascaleProfilesController::class, 'ideascaleProfiles'])->name('index');
        Route::post('/claim-ideascale-profile/{ideascaleProfile}', [IdeascaleProfilesController::class, 'claimIdeascaleProfile'])->name('claim');
        Route::get('/{ideascaleProfile:id}', [IdeascaleProfilesController::class, 'ideascale_profile'])->name('show');
        Route::get('/{uuid}/connections', [IdeascaleProfilesController::class, 'connections'])->name('connections');
    });

    Route::get('/fund-titles', [ProposalsController::class, 'fundTitles'])->name('fundTitles');

    // Note: /funds route is now handled by the new FundController above

    Route::get('/helpful-total', [ReviewsController::class, 'helpfulTotal'])->name('helpfulTotal');

    Route::get('/fund-counts', [GroupsController::class, 'getFundsWithProposalsCount'])->name('fundCounts');

    Route::prefix('/completed-project-nfts/')->as('completedProjectsNfts.')->group(
        function () {
            Route::get('/{proposal}/{nft}/details', [CompletedProjectNftsController::class, 'getNftDetails'])
                ->name('details');

            Route::post('/{proposal}/{nft}/update-metadata', [CompletedProjectNftsController::class, 'updateNftsMetadata'])
                ->name('update');
        }
    );

    Route::post('nmkr/notifications', action: [CompletedProjectNftsController::class, 'updateNftMintStatus'])->name('nmkr');

    Route::prefix('cardano')->as('cardano.')
        ->middleware([])
        ->group(function () {
            Route::prefix('budget-proposals')->as('budgetProposals.')
                ->middleware([])
                ->group(function () {
                    Route::get('/', [CardanoBudgetProposalController::class, 'index'])
                        ->name('index');
                    Route::get('/metrics', [CardanoBudgetProposalController::class, 'metrics'])
                        ->name('metrics');

                    Route::get('/metrics/catalyst-proposals/{username}', [CardanoBudgetProposalController::class, 'relatedCatalystProposalsCount'])
                        ->name('metrics.catalystProposals');

                    Route::get('/catalyst-proposals/{username}', [CardanoBudgetProposalController::class, 'relatedCatalystProposals'])
                        ->name('relatedCatalystProposals');
                });
        });

    Route::prefix('comments')->as('comments.')
        ->group(function () {
            Route::get('/', [CommentController::class, 'index'])->name('index');
            Route::post('/', [CommentController::class, 'store'])->name('store')
                ->middleware('throttle:15,1');
        });

    Route::prefix('/dreps')->as('dreps.')->middleware('auth')->group(
        function () {
            Route::post('delegate', [CatalystDrepController::class, 'delegate'])
                ->name('delegate');
            Route::post('undelegate', [CatalystDrepController::class, 'undelegate'])
                ->name('undelegate');
        }
    );

    Route::prefix('user')->as('user.')->middleware('auth')->group(function () {
        Route::post('language', [UserLanguageController::class, 'updateLanguage'])
            ->name('language.update');
        Route::get('language', [UserLanguageController::class, 'getCurrentLanguage'])
            ->name('language.current');
    });
});
