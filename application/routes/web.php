<?php

use App\Http\Controllers\VoterController;
use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DrepController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\FundsController;
use App\Http\Controllers\ChartsController;
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
use App\Http\Controllers\VoterListController;
use App\Http\Controllers\VoterToolController;
use App\Http\Controllers\CommunitiesController;
use App\Http\Controllers\ConnectionsController;
use App\Http\Controllers\JormungandrController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\CatalystDrepController;
use App\Http\Controllers\VoterHistoriesController;
use App\Http\Controllers\VotingWorkflowController;
use App\Http\Controllers\IdeascaleProfilesController;
use App\Http\Controllers\SignatureWorkflowController;
use App\Http\Controllers\CompletedProjectNftsController;
use App\Http\Controllers\CardanoBudgetProposalController;
use App\Http\Controllers\ClaimIdeascaleProfileController;
use App\Http\Controllers\WalletController;
use CodeZero\LocalizedRoutes\Controllers\FallbackController;

Route::localized(
    function () {
        Route::get('/', [HomeController::class, 'index'])
            ->name('home');

        Route::prefix('/proposals')->as('proposals.')->group(function () {
            Route::get('/', [ProposalsController::class, 'index'])
                ->name('index');

            Route::get('/charts', [ProposalsController::class, 'charts'])
                ->name('charts');

            Route::get('/{slug}', function ($slug) {
                return redirect()->route('proposals.group.details', ['slug' => $slug]);
            })->name('redirect');

            Route::prefix('/{slug}')->as('group.')->group(function () {
                Route::get('/details', [ProposalsController::class, 'proposal'])
                    ->name('details');

                Route::get('/community-review', [ProposalsController::class, 'proposal'])
                    ->name('communityReview');

                Route::get('/team-information', [ProposalsController::class, 'proposal'])
                    ->name('teamInformation');
            });
        });


        Route::get('/proposals', [ProposalsController::class, 'index'])
            ->name('proposals.index');

        //routes for demoing routing pages onto modals
        Route::get('/proposals/charts', [ProposalsController::class, 'charts'])
            ->name('proposals.charts');
        Route::get('/proposals/charts/detail', [ProposalsController::class, 'chartDetail'])
            ->name('proposals.charts.detail');

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
            Route::get('/', [CommunitiesController::class, 'index'])
                ->name('index');

            Route::prefix('/{community:slug}')->group(function () {
                Route::get('/', [CommunitiesController::class, 'show'])
                    ->name('show');

                Route::get('/dashboard', [CommunitiesController::class, 'show'])
                    ->name('dashboard');

                Route::get('/proposals', [CommunitiesController::class, 'show'])
                    ->name('proposals');

                Route::get('/ideascale-profiles', [CommunitiesController::class, 'show'])
                    ->name('ideascaleProfiles');

                Route::get('/groups', [CommunitiesController::class, 'show'])
                    ->name('groups');

                Route::get('/events', [CommunitiesController::class, 'show'])
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
                    Route::get('/{step}', [CompletedProjectNftsController::class, 'handleStep'])
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

            Route::prefix('/create-voter-list/steps')->as('createVoterList.')
                ->middleware([WorkflowMiddleware::class])
                ->group(function () {
                    Route::get('/{step}', [VoterListController::class, 'handleStep'])
                        ->name('index');
                    Route::post('/save-list-details', [VoterListController::class, 'saveListDetails'])
                        ->name('saveListDetails');
                    Route::post('/save-proposals', [VoterListController::class, 'saveProposals'])
                        ->name('saveProposals');
                    Route::post('/save-rationales', [VoterListController::class, 'saveRationales'])
                        ->name('saveRationales');
                });

            Route::get('/create-voter-list/success', [VoterListController::class, 'success'])
                ->name('createVoterList.success');

            Route::prefix('/submit-votes/steps')->as('voting.')
                ->middleware([WorkflowMiddleware::class])
                ->group(function () {
                    Route::get('/success', [VotingWorkflowController::class, 'success'])
                        ->name('success');
                    Route::get('/{step}', [VotingWorkflowController::class, 'handleStep'])
                        ->name('index');
                    Route::post('/save-decisions', [VotingWorkflowController::class, 'saveVotingDecisions'])
                        ->name('saveDecisions');
                    Route::post('/sign-ballot', [VotingWorkflowController::class, 'signBallot'])
                        ->name('signBallot');
                    Route::post('/submit-votes', [VotingWorkflowController::class, 'submitVotes'])
                        ->name('submitVotes');
                });

            Route::prefix('/create-bookmarks/steps')->as('bookmarks.')
                ->middleware([WorkflowMiddleware::class])
                ->group(function () {
                    Route::get('/success', [BookmarksController::class, 'success'])
                        ->name('success');
                    Route::get('/{step}', [BookmarksController::class, 'handleStep'])
                        ->name('index');
                    Route::post('/save-list', [BookmarksController::class, 'saveList'])
                        ->name('saveList');
                    Route::post('{bookmarkCollection}/add-list-item/', [BookmarksController::class, 'addBookmarkItem'])
                        ->name('addBookmarkItem');
                    Route::post('{bookmarkCollection}/remove-list-item/', [BookmarksController::class, 'removeBookmarkItem'])
                        ->name('removeBookmarkItem');
                    Route::post('{bookmarkCollection}/save-rationales', [BookmarksController::class, 'saveRationales'])
                        ->name('saveRationales');
                });

            Route::prefix('/drep-sign-up/steps')->as('drepSignUp.')
                ->middleware([WorkflowMiddleware::class])
                ->group(function () {
                    Route::get('/{step}', [CatalystDrepController::class, 'handleStep'])
                        ->name('index');
                    Route::post('/drep', [CatalystDrepController::class, 'saveDrep'])
                        ->name('create');
                    Route::patch('{catalystDrep}/drep', [CatalystDrepController::class, 'updateDrep'])
                        ->name('patch');
                    Route::post('{catalystDrep}/validate-drep-wallet', [CatalystDrepController::class, 'validateDrepWallet'])
                        ->name('validateWallet');
                    Route::post('{catalystDrep}/capture-signature', [CatalystDrepController::class, 'captureSignature'])
                        ->name('captureSignature');
                });

            Route::prefix('/signature-capture/steps')->as('signature.')
                ->middleware([WorkflowMiddleware::class])
                ->group(function () {
                    Route::get('/success', [SignatureWorkflowController::class, 'success'])
                        ->name('success');
                    Route::get('/{step}', [SignatureWorkflowController::class, 'handleStep'])
                        ->name('index');
                    Route::post('/sign-message', [SignatureWorkflowController::class, 'signMessage'])
                        ->name('signMessage');
                    Route::post('/save-signature', [SignatureWorkflowController::class, 'saveSignature'])
                        ->name('saveSignature');
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

        Route::prefix('/milestones')->as('milestones.')->group(function () {
            Route::get('/', [MilestoneController::class, 'index'])
                ->name('index');
        });

        Route::prefix('/reviews')->as('reviews.')->group(function () {

            Route::prefix('/{review:hash}')->middleware(['auth'])->group(function () {
                Route::post('/not-helpful', [ReviewsController::class, 'notHelpfulReview'])->name('notHelpful');
                Route::post('/helpful', [ReviewsController::class, 'helpfulReview'])->name('helpful');
            });
            Route::get('/{review}', [ReviewsController::class, 'review'])
                ->name('review')
                ->where('review', '[0-9]+');

            Route::get('/', [ReviewsController::class, 'index'])
                ->name('index');
        });

        Route::prefix('numbers')->as('numbers.')->group(function () {
            Route::get('/', [NumbersController::class, 'index'])
                ->name('index');
        });

        Route::prefix('lists')->as('lists.')->group(function () {
            Route::get('/', [BookmarksController::class, 'index'])
                ->name('index');
            Route::get('/{bookmarkCollection}/manage/{type?}', [BookmarksController::class, 'manage'])
                ->middleware('auth')
                ->name('manage');
            Route::get('/{bookmarkCollection}/{type?}', [BookmarksController::class, 'view'])
                ->name('view');
        });

        Route::get('/charts', [ChartsController::class, 'index'])
            ->name('charts.index');

        Route::prefix('/completed-project-nfts')->as('completedProjectsNfts.')->group(
            function () {
                Route::get('/', [CompletedProjectNftsController::class, 'index'])
                    ->name('index');

                Route::get('/{proposal:hash}/mint', [CompletedProjectNftsController::class, 'show'])
                    ->name('show');
            }
        );

        Route::prefix('nfts')->as('crud.nfts.')->group(function () {
            Route::patch('/update/{nft:id}', [CompletedProjectNftsController::class, 'updateMetadata'])
                ->name('update');
        });

        Route::prefix('jormungandr')->as('jormungandr.')->group(function () {
            Route::get('/', [JormungandrController::class, 'index'])
                ->name('index');

            Route::prefix('/transactions')->as('transactions.')->group(function () {
                Route::get('/', [TransactionController::class, 'index'])
                    ->name('index');
                Route::get('/{transaction}', [TransactionController::class, 'show'])
                    ->name('show');
            });

            Route::prefix('/wallets')->as('wallets.')->group(function () {
                Route::get('/{stakeKey}/{catId}', [WalletController::class, 'show'])
                    ->name('show');
            });

            Route::prefix('/votes')->as('votes.')->group(function () {
                Route::get('/', [VoterHistoriesController::class, 'index'])
                    ->name('index');
            });

            Route::prefix('/voters')->as('voters.')->group(function () {
                Route::get('/', [VoterController::class, 'index'])
                    ->name('index');
            });
        });

        // Dreps
        Route::prefix('/dreps')->as('dreps.')->group(
            function () {
                Route::get('/', [CatalystDrepController::class, 'index'])
                    ->name('index');

                Route::get('/list', [CatalystDrepController::class, 'list'])
                    ->name('list');
            }
        );

        Route::prefix('/votes')->as('votes.')->group(function () {
            Route::get('/', [VoterHistoriesController::class, 'index'])
                ->name('index');
        });

        Route::get('/voter-tool', [VoterToolController::class, 'index'])
            ->name('voter-tool.index');

        Route::get('/s', [SearchController::class, 'index'])
            ->name('search.index');

        // Milestones
        Route::prefix('/milestone/{milestones}')->group(function () {
            Route::get('/', [MilestoneController::class, 'index'])
                ->name('index');
        });

        // Cardano Budget Proposals
        Route::prefix('/cardano')->as('cardano.')
            ->group(function () {
                Route::get('/budget-proposals/{username}', [CardanoBudgetProposalController::class, 'loadProposalsInExplorer'])
                    ->name('budgetProposals');
            });
        Route::get('/map', function () {
            return Inertia::render('Map');
        });
    }

);



require __DIR__ . '/auth.php';

require __DIR__ . '/dashboard.php';

require __DIR__ . '/api.php';

Route::fallback(FallbackController::class);
