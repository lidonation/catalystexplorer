<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\NftController;
use App\Http\Controllers\DrepController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\FundsController;
use App\Http\Controllers\GroupsController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\NumbersController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReviewsController;
use App\Http\Middleware\WorkflowMiddleware;
use App\Http\Controllers\WorkflowController;
use App\Http\Controllers\BookmarksController;
use App\Http\Controllers\CampaignsController;
use App\Http\Controllers\MilestoneController;
use App\Http\Controllers\ProposalsController;
use App\Http\Controllers\VoterHistoryController;
use App\Http\Controllers\VoterToolController;
use App\Http\Controllers\ConnectionsController;
use App\Http\Controllers\JormungandrController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\Api\CommunityController;
use App\Http\Controllers\IdeascaleProfilesController;
use App\Http\Controllers\CompletetProjectNftsController;
use App\Http\Controllers\ClaimIdeascaleProfileController;

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

            Route::prefix('/{group:slug}')->as('group.')->group(function () {
                Route::get('/', [GroupsController::class, 'group'])
                    ->name('index');

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

            Route::prefix('/{community:slug}')->group(function () {
                Route::get('/', [CommunityController::class, 'show'])
                    ->name('show');

                Route::get('/dashboard', [CommunityController::class, 'show'])
                    ->name('dashboard');

                Route::get('/proposals', [CommunityController::class, 'show'])
                    ->name('proposals');

                Route::get('/members', [CommunityController::class, 'show'])
                    ->name('members');
                    
                Route::get('/groups', [CommunityController::class, 'show'])
                    ->name('groups');

                Route::get('/events', [CommunityController::class, 'show'])
                    ->name('events');    
            });
        });

        Route::prefix('connections')->as('connections.')->group(function () {
            Route::get('/', [ConnectionsController::class, 'index'])
                ->name('index');
        });


        Route::prefix('/workflows')->as('workflows.')->group(function () {

            Route::prefix('/completed-projects-nfts/steps')->as('completedProjectsNft.')
                ->middleware([WorkflowMiddleware::class])
                ->group(function () {
                    Route::get('/{step}', [CompletetProjectNftsController::class, 'handleStep'])
                        ->name('index');
                });

            Route::prefix('/claim-ideascale-profile/steps')->as('claimIdeascaleProfile.')
                ->middleware([WorkflowMiddleware::class])
                ->group(function () {
                    Route::get('/{step}', [ClaimIdeascaleProfileController::class, 'handleStep'])
                        ->name('index');
                    Route::post('/{ideascaleProfile}/claim', [ClaimIdeascaleProfileController::class, 'claimIdeascaleProfile'])
                        ->name('saveClaim');
                });

            Route::get('/login', [WorkflowController::class, 'auth'])
                ->name('loginForm');
            Route::post('/login', [WorkflowController::class, 'login'])
                ->name('login');
        });

        Route::patch('/profile/update/{field}', [ProfileController::class, 'update'])
            ->name('profile.update.field');
        Route::patch('/profile/socials', [ProfileController::class, 'updateSocials'])
            ->name('profile.update.socials');
        Route::post('/profile/photo', [ProfileController::class, 'updatePhoto'])
            ->name('profile.photo.update');
        Route::delete('/profile/photo', [ProfileController::class, 'destroyPhoto'])
            ->name('profile.photo.destroy');

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

                Route::get('/campaigns', [IdeascaleProfilesController::class, 'show'])
                    ->name('campaigns');
            });
        });

        Route::prefix('/reviews')->as('reviews.')->group(function () {
            Route::get('/', [ReviewsController::class, 'index'])
                ->name('index');
            Route::get('/{review}', [ReviewsController::class, 'review'])
                ->name('review')
                ->where('review', '[0-9]+');
        });

        Route::prefix('numbers')->as('numbers.')->group(function () {
            Route::get('/', [NumbersController::class, 'index'])
                ->name('index');
        });

        Route::prefix('bookmarks')->as('bookmarks.')->group(function () {
            Route::get('/', [BookmarksController::class, 'index'])
                ->name('index');
        });

        Route::prefix('/completed-project-nfts')->as('completedProjectsNfts.')->group(
            function () {
                Route::get('/', [CompletetProjectNftsController::class, 'index'])
                    ->name('index');

                Route::get('/{proposal}/mint', [CompletetProjectNftsController::class, 'show'])
                    ->name('show');
            }
        );

        Route::prefix('nfts')->as('crud.nfts.')->group(function () {
            Route::patch('/update/{nft:id}', [CompletetProjectNftsController::class, 'updateMetadata'])
                ->name('update');
        });

        Route::prefix('jormungandr')->as('jormungandr.')->group(function () {
            Route::get('/', [JormungandrController::class, 'index'])
                ->name('index');

            Route::prefix('/transactions')->as('transactions.')->group(function () {
                Route::get('/', [TransactionController::class, 'index'])
                    ->name('index');
                Route::get('/{txHash}', [TransactionController::class, 'show'])
                    ->name('show');
            });
        });

        // Dreps
        Route::prefix('/dreps')->as('dreps.')->group(
            function () {
                Route::get('/', [DrepController::class, 'index'])
                    ->name('index');

                Route::get('/list', [DrepController::class, 'list'])
                    ->name('list');
            }
        );

        Route::prefix('/votes')->as('votes.')->group(function () {
            Route::get('/', [VoterHistoryController::class, 'index'])
                ->name('index');
        }); 

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

require __DIR__ . '/auth.php';

require __DIR__ . '/dashboard.php';

require __DIR__ . '/api.php';

Route::fallback(\CodeZero\LocalizedRoutes\Controllers\FallbackController::class);

