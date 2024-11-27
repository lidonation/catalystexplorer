<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\GroupController;
use App\Http\Controllers\Api\CampaignController;

Route::prefix('api')->group(function () {
    Route::get('/groups', [GroupController::class, 'groups'])->name('group');
    Route::get('/groups/{group:id}', [GroupController::class, 'group']);

    Route::get('/campaigns', [CampaignController::class, 'campaigns'])->name('campaign');
    Route::get('/campaigns/{campaign:id}', [CampaignController::class, 'campaign']);
});
