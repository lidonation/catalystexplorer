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
use App\Http\Controllers\My\MyBookmarksController;
use App\Http\Controllers\VoterHistoriesController;
use App\Http\Controllers\CompletedProjectNftsController;
use App\Http\Controllers\Api\IdeascaleProfilesController;
use App\Http\Controllers\CardanoBudgetProposalController;
use Inertia\Inertia;

Route::prefix('api')->as('api.')->group(function () {
    Route::get('/', fn() => Inertia::render(component: 'ComingSoon', props: ['context' => 'API']))->name('index');

    Route::get('/groups', [GroupController::class, 'groups'])->name('groups');
    Route::get('/groups/{group:id}', [GroupController::class, 'group'])->name('group');
    Route::get('/groups/{hash}/connections', [GroupController::class, 'connections'])->name('groups.connections');

    Route::get('/choices', [VoterHistoriesController::class, 'getChoices'])->name('choices');

    Route::get('/campaigns', [CampaignController::class, 'campaigns'])->name('campaigns');
    Route::get('/campaigns/{campaign:id}', [CampaignController::class, 'campaign'])->name('campaign');

    Route::get('/tags', [TagController::class, 'tags'])->name('tags');
    Route::get('/tags/{tag:id}', [TagController::class, 'tag'])->name('tag');

    Route::get('/proposals', [ProposalController::class, 'proposals'])->name('proposals');

    Route::get('/reviewers', [ReviewerController::class, 'reviewers'])->name('reviewers');

    Route::get('/reviews', [ReviewController::class, 'reviews'])->name('reviews');

    Route::get('/ideascaleProfiles', [IdeascaleProfilesController::class, 'ideascaleProfiles'])->name('ideascaleProfiles');

    Route::get('/communities', [CommunityController::class, 'communities'])->name('communities');
    Route::get('/communities/{community:id}', [CommunitiesController::class, 'community'])->name('community');

    Route::get('/communities/{hash}/connections', [CommunitiesController::class, 'connections'])->name('communities.connections');
    Route::post('/communities/{hash}/join', [CommunitiesController::class, 'join'])->name('community.join');

    Route::prefix('bookmark-items')->as('bookmarks.')
        ->group(function () {
            Route::post('/{modelType}/{hash}/{bookmarkCollection?}', [MyBookmarksController::class, 'store'])
                ->middleware('auth')
                ->name('store');
            Route::delete('/{bookmarkItem}', [MyBookmarksController::class, 'delete'])
                ->name('remove');
            Route::get('/{modelType}/{hash}/status', [MyBookmarksController::class, 'status'])
                ->name('status');
        });

    Route::prefix('collection-items')->as('collections.')
        ->middleware('auth')
        ->group(function () {
            Route::post('/create', [MyBookmarksController::class, 'createCollection'])
                ->name('create');
            Route::post('{bookmarkCollection}/update', [MyBookmarksController::class, 'updateCollection'])
                ->name('update');
            Route::post('{bookmarkCollection}/delete', [MyBookmarksController::class, 'deleteCollection'])
                ->name('delete');
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
        Route::get('/{hash}/connections', [IdeascaleProfilesController::class, 'connections'])->name('connections');
    });

    Route::get('/fund-titles', [ProposalsController::class, 'fundTitles'])->name('fundTitles');

    Route::get('/funds', [ProposalsController::class, 'funds'])->name('funds');


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

});
