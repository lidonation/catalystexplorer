<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\GroupController;
use App\Http\Controllers\Api\CampaignController;
use App\Http\Controllers\Api\TagController;
use App\Http\Controllers\Api\CommunityController;

Route::prefix('api')->group(function () {
    Route::get('/groups', [GroupController::class, 'groups'])->name('group');
    Route::get('/groups/{group:id}', [GroupController::class, 'group']);

    Route::get('/campaigns', [CampaignController::class, 'campaigns'])->name('campaign');
    Route::get('/campaigns/{campaign:id}', [CampaignController::class, 'campaign']);

    Route::get('/tags', [TagController::class, 'tags'])->name('tag');
    Route::get('/tags/{tag:id}', [TagController::class, 'tag']);

    Route::get('/communities', [CommunityController::class, 'communities'])->name('community');
    Route::get('/communities/{community:id}', [CommunityController::class, 'community']);
});
