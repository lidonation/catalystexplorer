<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\GroupController;
use App\Http\Controllers\Api\CampaignController;
use App\Http\Controllers\Api\TagController;
use App\Http\Controllers\Api\CommunityController;
use App\Http\Controllers\Api\IdeascaleProfilesController;
use App\Http\Controllers\ProposalsController;

Route::prefix('api')->as('api.')->group(function () {
    Route::get('/groups', [GroupController::class, 'groups'])->name('groups');
    Route::get('/groups/{group:id}', [GroupController::class, 'group'])->name('group');

    Route::get('/campaigns', [CampaignController::class, 'campaigns'])->name('campaigns');
    Route::get('/campaigns/{campaign:id}', [CampaignController::class, 'campaign'])->name('campaign');

    Route::get('/tags', [TagController::class, 'tags'])->name('tags');
    Route::get('/tags/{tag:id}', [TagController::class, 'tag'])->name('tag');

    Route::get('/communities', [CommunityController::class, 'communities'])->name('communities');
    Route::get('/communities/{community:id}', [CommunityController::class, 'community'])->name('community');

    Route::get('/ideascale-profiles', [IdeascaleProfilesController::class, 'ideascale_profiles'])->name('ideascaleProfiles');
    Route::get('/ideascale-profiles/{ideascale_profile:id}', [IdeascaleProfilesController::class, 'ideascale_profile'])->name('ideascaleProfile');

    Route::get('/fund-titles',  [ProposalsController::class, 'fundTitles'])->name('fundTitles');
});
