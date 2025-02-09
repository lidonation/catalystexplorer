<?php

use App\Interfaces\Http\Controllers\CampaignsController;
use App\Interfaces\Http\Controllers\ChartsController;
use App\Interfaces\Http\Controllers\CompletetProjectNftsController;
use App\Interfaces\Http\Controllers\FundsController;
use App\Interfaces\Http\Controllers\GroupsController;
use App\Interfaces\Http\Controllers\HomeController;
use App\Interfaces\Http\Controllers\IdeascaleProfilesController;
use App\Interfaces\Http\Controllers\JormungandrController;
use App\Interfaces\Http\Controllers\ProposalsController;
use App\Interfaces\Http\Controllers\ReviewsController;
use App\Interfaces\Http\Controllers\SearchController;
use App\Interfaces\Http\Controllers\VoterToolController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::localized(
    function () {
        Route::get('/', [HomeController::class, 'index'])
            ->name('home');

        Route::get('/proposals', [ProposalsController::class, 'index'])
            ->name('proposals.index');

        Route::prefix('/funds')->as('funds.')->group(function () {
            Route::get('/', [FundsController::class, 'index'])
                ->name('index');

            Route::prefix('/{fund:slug}')->as('fund.')->group(function () {
                Route::get('/', [FundsController::class, 'fund'])
                    ->name('show');

                Route::prefix('/campaigns')->as('campaigns.')->group(function () {
                    Route::get('/{campaign:slug}', [CampaignsController::class, 'show'])
                        ->name('campaign.show');
                });
            });
        });

        Route::prefix('/groups')->as('groups.')->group(function () {
            Route::get('/', [GroupsController::class, 'index'])
                ->name('index');

            Route::get('/{group:slug}', [GroupsController::class, 'group'])
                ->name('group');
        });

        Route::get('/ideascale-profiles', [IdeascaleProfilesController::class, 'index'])
            ->name('ideascaleProfiles.index');

        Route::prefix('/reviews')->as('reviews.')->group(function () {
            Route::get('/', [ReviewsController::class, 'index'])
                ->name('index');
            Route::get('/{review}', [ReviewsController::class, 'review'])
                ->name('review')
                ->where('review', '[0-9]+');
        });

        Route::get('/charts', [ChartsController::class, 'index'])
            ->name('charts.index');

        Route::get('/completed-project-nfts', [CompletetProjectNftsController::class, 'index'])
            ->name('completedProjectsNfts.index');

        Route::get('/completed-project-nfts/{proposal:id}', [CompletetProjectNftsController::class, 'show'])
            ->name('completedProjectsNfts.show');

        Route::get('/jormungandr', [JormungandrController::class, 'index'])
            ->name('jormungandr.index');

        Route::get('/voter-tool', [VoterToolController::class, 'index'])
            ->name('voter-tool.index');

        Route::get('/s', [SearchController::class, 'index'])
            ->name('search.index');
    }
);

Route::get('/map', function () {
    return Inertia::render('Map');
});

require __DIR__.'/auth.php';

require __DIR__.'/dashboard.php';

require __DIR__.'/api.php';

Route::fallback(\CodeZero\LocalizedRoutes\Controllers\FallbackController::class);
