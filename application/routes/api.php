<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\GroupsController;
use App\Http\Controllers\Api\TagController;
use App\Http\Controllers\Api\GroupController;
use App\Http\Controllers\ProposalsController;
use App\Http\Controllers\ReviewsController;
use App\Http\Controllers\CommunitiesController;
use App\Http\Controllers\Api\CampaignController;
use App\Http\Controllers\My\MyBookmarksController;
use App\Http\Controllers\CompletetProjectNftsController;
use App\Http\Controllers\Api\IdeascaleProfilesController;

Route::prefix('api')->as('api.')->group(function () {
    Route::get('/groups', [GroupController::class, 'groups'])->name('groups');
    Route::get('/groups/{group:id}', [GroupController::class, 'group'])->name('group');
    Route::get('/groups/{hash}/connections', [GroupController::class, 'connections'])->name('groups.connections');

    Route::get('/campaigns', [CampaignController::class, 'campaigns'])->name('campaigns');
    Route::get('/campaigns/{campaign:id}', [CampaignController::class, 'campaign'])->name('campaign');

    Route::get('/tags', [TagController::class, 'tags'])->name('tags');
    Route::get('/tags/{tag:id}', [TagController::class, 'tag'])->name('tag');

    Route::get('/communities', [CommunitiesController::class, 'communities'])->name('communities');
    Route::get('/communities/{community:id}', [CommunitiesController::class, 'community'])->name('community');
    Route::get('/communities/{hash}/connections', [CommunitiesController::class, 'connections'])->name('communities.connections');
    Route::post('/communities/{hash}/join', [CommunitiesController::class, 'join'])->name('community.join');

    Route::prefix('bookmark-items')->as('bookmarks.')
        ->group(function () {
            Route::post('/{modelType}/{hash}', [MyBookmarksController::class, 'store'])
                ->middleware('auth')
                ->name('store');
            Route::delete('/{hash}', [MyBookmarksController::class, 'delete'])
                ->name('remove');
            Route::get('/{modelType}/{hash}/status', [MyBookmarksController::class, 'status'])
                ->name('status');
        });

    Route::prefix('collection-items')->as('collections.')
        ->middleware('auth')
        ->group(function () {
            Route::post('/create', [MyBookmarksController::class, 'createCollection'])
                ->name('create');
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

    Route::get('/proposal-titles', [ReviewsController::class, 'proposalTitles'])->name('proposalTitles');

    Route::get('/reviewer-ids', [ReviewsController::class, 'reviewerIds'])->name('reviewerIds');

    Route::get('/helpful-total', [ReviewsController::class, 'helpfulTotal'])->name('helpfulTotal');

    Route::get('/fund-counts', [GroupsController::class, 'getFundsWithProposalsCount'])->name('fundCounts');

    Route::prefix('/completed-project-nfts/')->as('completedProjectsNfts.')->group(
        function () {
            Route::get('/{proposal}/{nft}/details', [CompletetProjectNftsController::class, 'getNftDetails'])
                ->name('details');

            Route::post('/{proposal}/{nft}/update-metadata', [CompletetProjectNftsController::class, 'updateNftsMetadata'])
                ->name('update');
        }
    );

    Route::post('nmkr/notifications', action: [CompletetProjectNftsController::class, 'updateNftMintStatus'])->name('nmkr');
});
