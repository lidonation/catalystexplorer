<?php

use App\Http\Controllers\Api\CommunityController;
use App\Http\Controllers\CampaignsController;
use App\Http\Controllers\ChartsController;
use App\Http\Controllers\CompletetProjectNftsController;
use App\Http\Controllers\FundsController;
use App\Http\Controllers\GroupsController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\IdeascaleProfilesController;
use App\Http\Controllers\JormungandrController;
use App\Http\Controllers\MilestoneController;
use App\Http\Controllers\ProposalsController;
use App\Http\Controllers\ReviewsController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\VoterToolController;
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

            Route::prefix('/{group:slug}')->group(function () {
                Route::get('/', [GroupsController::class, 'group'])
                    ->name('group');

                Route::get('/proposals', [GroupsController::class, 'group'])
                    ->name('proposals');

                Route::get('/connections', [GroupsController::class, 'group'])
                    ->name('connections');

                Route::get('/ideascale-profiles', [GroupsController::class, 'group'])
                    ->name('ideascaleProfiles');

                Route::get('/reviews', [GroupsController::class, 'group'])
                    ->name('reviews');

                Route::get('/locations', [GroupsController::class, 'group'])
                    ->name('locations');
            });
        });

        Route::prefix('/communities')->as('communities.')->group(function () {
            Route::get('/', [CommunityController::class, 'index'])
                ->name('index');

            Route::get('/{community:slug}', [CommunityController::class, 'community'])
                ->name('group');
        });

        Route::prefix('/ideascale-profiles')->as('ideascaleProfiles.')->group(function () {
            Route::get('/', [IdeascaleProfilesController::class, 'index'])
                ->name('index');

            Route::prefix('/{ideascaleProfile}')->group(function () {
                Route::get('/', [IdeascaleProfilesController::class, 'show'])
                    ->name('show');

                Route::get('/proposals', [IdeascaleProfilesController::class, 'show'])
                    ->name('proposals');

                Route::get('/connections', [IdeascaleProfilesController::class, 'show'])
                    ->name('connections');

                Route::get('/groups', [IdeascaleProfilesController::class, 'show'])
                    ->name('groups');

                Route::get('/communities', [IdeascaleProfilesController::class, 'show'])
                    ->name('communities');

                Route::get('/reviews', [IdeascaleProfilesController::class, 'show'])
                    ->name('reviews');

                Route::get('/milestones', [IdeascaleProfilesController::class, 'show'])
                    ->name('milestones');

                Route::get('/reports', [IdeascaleProfilesController::class, 'show'])
                    ->name('reports');

                Route::get('/cam', [IdeascaleProfilesController::class, 'show'])
                    ->name('cam');
            });
        });

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

        Route::get('/completed-project-nfts/{proposal}', [CompletetProjectNftsController::class, 'show'])
            ->name('completedProjectsNfts.show');

        Route::get('/jormungandr', [JormungandrController::class, 'index'])
            ->name('jormungandr.index');

        Route::get('/voter-tool', [VoterToolController::class, 'index'])
            ->name('voter-tool.index');

        Route::get('/s', [SearchController::class, 'index'])
            ->name('search.index');

        // Milestones
        Route::prefix('/{milestones}')->group(function () {
            Route::get('/', [MilestoneController::class, 'index'])
                ->name('index');
        });
    }
);

Route::get('/map', function () {
    return Inertia::render('Map');
});

require __DIR__.'/auth.php';

require __DIR__.'/dashboard.php';

require __DIR__.'/api.php';

Route::fallback(\CodeZero\LocalizedRoutes\Controllers\FallbackController::class);
