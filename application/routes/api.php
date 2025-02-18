<?php

use App\Interfaces\Http\Controllers\Api\CampaignController;
use App\Interfaces\Http\Controllers\Api\CommunityController;
use App\Interfaces\Http\Controllers\Api\GroupController;
use App\Interfaces\Http\Controllers\Api\IdeascaleProfilesController;
use App\Interfaces\Http\Controllers\Api\TagController;
use App\Interfaces\Http\Controllers\GroupsController;
use App\Interfaces\Http\Controllers\My\MyBookmarksController;
use App\Interfaces\Http\Controllers\ProposalsController;
use Illuminate\Support\Facades\Route;

Route::prefix('api')->as('api.')->group(function () {
    Route::get('/groups', [GroupController::class, 'groups'])->name('groups');
    Route::get('/groups/{group:id}', [GroupController::class, 'group'])->name('group');
    Route::get('/groups/{hash}/connections', [GroupsController::class, 'getConnectionsData'])->name('connections');

    Route::get('/campaigns', [CampaignController::class, 'campaigns'])->name('campaigns');
    Route::get('/campaigns/{campaign:id}', [CampaignController::class, 'campaign'])->name('campaign');

    Route::get('/tags', [TagController::class, 'tags'])->name('tags');
    Route::get('/tags/{tag:id}', [TagController::class, 'tag'])->name('tag');

    Route::get('/communities', [CommunityController::class, 'communities'])->name('communities');
    Route::get('/communities/{community:id}', [CommunityController::class, 'community'])->name('community');

    Route::prefix('bookmark-items')->as('bookmarks.')
        ->group(function () {
            Route::post('/{modelType}/{hash}', [MyBookmarksController::class, 'store'])->middleware('auth')
                ->name('store');
            Route::delete('/{hash}', [MyBookmarksController::class, 'delete'])
                ->name('remove');
            Route::get('/{modelType}/{hash}/status', [MyBookmarksController::class, 'status'])
                ->name('status');
        });

    Route::prefix('ideascale-profiles')->as('ideascaleProfiles.')->group(function () {
        Route::get('/', [IdeascaleProfilesController::class, 'ideascaleProfiles'])->name('index');
        Route::get('/{ideascaleProfile:id}', [IdeascaleProfilesController::class, 'ideascale_profile'])->name('show');
        Route::get('/{profile}/connections', [IdeascaleProfilesController::class, 'connections'])->name('connections');
    });

    Route::get('/fund-titles', [ProposalsController::class, 'fundTitles'])->name('fundTitles');

    Route::get('/fund-counts', [GroupsController::class, 'getFundsWithProposalsCount'])->name('fundCounts');
});
