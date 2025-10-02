<?php

use App\Http\Controllers\VoterController;
use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\FundsController;
use App\Http\Controllers\ChartsController;
use App\Http\Controllers\GroupsController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReviewsController;
use App\Http\Middleware\WorkflowMiddleware;
use App\Http\Controllers\WorkflowController;
use App\Http\Controllers\BookmarksController;
use App\Http\Controllers\CampaignsController;
use App\Http\Controllers\MilestoneController;
use App\Http\Controllers\ProposalsController;
use App\Http\Controllers\Api\ProposalController;
use App\Http\Controllers\VoterListController;
use App\Http\Controllers\VoterToolController;
use App\Http\Controllers\CommunitiesController;
use App\Http\Controllers\ConnectionsController;
use App\Http\Controllers\JormungandrController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\CatalystDrepController;
use App\Http\Controllers\VoterHistoriesController;
use App\Http\Controllers\IdeascaleProfilesController;
use App\Http\Controllers\SignatureWorkflowController;
use App\Http\Controllers\TinderProposalWorkflowController;
use App\Http\Controllers\CompletedProjectNftsController;
use App\Http\Controllers\CardanoBudgetProposalController;
use App\Http\Controllers\ClaimCatalystProfileWorkflowController;
use App\Http\Controllers\ClaimIdeascaleProfileController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\PublishToIpfsController;
use App\Http\Controllers\WalletController;
use CodeZero\LocalizedRoutes\Controllers\FallbackController;

Route::localized(
    function () {
        Route::get('/', [HomeController::class, 'index'])
            ->name('home');


        Route::prefix('/proposals')->as('proposals.')->group(function () {
            Route::get('/', [ProposalsController::class, 'index'])
                ->name('index');

            Route::get('/map', [ProposalsController::class, 'getProposalPropertyMap'])
                ->middleware('auth')
                ->name('map');


            Route::post('/test-modal', function () {
                return response()->json(['message' => 'OK', 'time' => now()]);
            })->name('test');

            Route::get('/csvs', fn() => Inertia::render('ComingSoon', ['context' => 'CSVs']))
                ->name('csvs');

            Route::get('/{slug}', function ($slug) {
                return redirect()->route('proposals.proposal.details', ['slug' => $slug]);
            })->name('redirect');

            Route::prefix('/{slug}')->as('proposal.')->group(function () {
                Route::get('/details', [ProposalsController::class, 'proposal'])
                    ->name('details');

                Route::get('/schedule', [ProposalsController::class, 'proposalSchedule'])
                    ->name('schedule');

                Route::get('/community-review', [ProposalsController::class, 'proposal'])
                    ->name('communityReview');

                Route::get('/team-information', [ProposalsController::class, 'proposal'])
                    ->name('teamInformation');
            });

            Route::post('/{id}/rationale', [ProposalController::class, 'storeRationale'])
                ->middleware('auth')
                ->name('rationale.store');
        });


        Route::get('/proposals', [ProposalsController::class, 'index'])
            ->name('proposals.index');

        //routes for demoing routing pages onto modals
        //        Route::get('/proposals/charts', [ProposalsController::class, 'charts'])
        //            ->name('charts');

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

                Route::post('/join', [CommunitiesController::class, 'join'])
                    ->middleware('auth')
                    ->name('join');
            });
        });

        Route::prefix('connections')->as('connections.')->group(function () {
            Route::get('/', [ConnectionsController::class, 'index'])
                ->name('index');
        });

        // Bookmark invitation acceptance route (DEPRECATED - kept for backwards compatibility)
        // New invitations should use the workflow route: workflows.acceptInvitation.index
        Route::get('/bookmark-invitation/accept', [BookmarksController::class, 'acceptInvitation'])
            ->middleware('signed')
            ->name('bookmark.invitation.accept');

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
                    Route::get('/success', [VoterListController::class, 'success'])
                        ->name('success');
                    Route::get('/{step}', [VoterListController::class, 'handleStep'])
                        ->name('index');

                    Route::post('/save-list-details', [VoterListController::class, 'saveListDetails'])
                        ->name('saveListDetails');
                    Route::post('/save-proposals', [VoterListController::class, 'saveProposals'])
                        ->name('saveProposals');
                    Route::post('/save-rationales', [VoterListController::class, 'saveRationales'])
                        ->name('saveRationales');
                    Route::post('/sign-ballot', [VoterListController::class, 'signBallot'])
                        ->name('signBallot');
                });

            Route::prefix('/create-service/steps')->as('createService.')
                ->middleware([WorkflowMiddleware::class])
                ->group(function () {
                    Route::get('/success', [ServiceController::class, 'success'])
                        ->name('success');
                    Route::post('/1/save', [ServiceController::class, 'saveServiceDetails'])
                        ->name('saveServiceDetails');
                    Route::post('/2/save', [ServiceController::class, 'saveContactAndLocation'])
                        ->name('saveContactAndLocation');
                    Route::post('/save-contact', [ServiceController::class, 'saveContactInfo'])
                        ->name('saveContactInfo');
                    Route::get('/{step}', [ServiceController::class, 'handleStep'])
                        ->name('index');
                });

            Route::prefix('/publish-to-ipfs/steps')->as('publishToIpfs.')
                ->middleware([WorkflowMiddleware::class])
                ->group(function () {
                    Route::get('/success', [PublishToIpfsController::class, 'success'])
                        ->name('success');
                    Route::post('/publish-list', [PublishToIpfsController::class, 'publishListToIpfs'])
                        ->name('publishListToIpfs');
                    Route::get('/{step}', [PublishToIpfsController::class, 'handleStep'])
                        ->name('index');
                });


            // Route::prefix('/submit-votes/steps')->as('voting.')
            //     ->middleware([WorkflowMiddleware::class])
            //     ->group(function () {
            //         Route::get('/success', [VotingWorkflowController::class, 'success'])
            //             ->name('success');
            //         Route::get('/{step}', [VotingWorkflowController::class, 'handleStep'])
            //             ->name('index');
            //         Route::post('/save-decisions', [VotingWorkflowController::class, 'saveVotingDecisions'])
            //             ->name('saveDecisions');
            //         Route::post('/sign-ballot', [VotingWorkflowController::class, 'signBallot'])
            //             ->name('signBallot');
            //         Route::post('/submit-votes', [VotingWorkflowController::class, 'submitVotes'])
            //             ->name('submitVotes');
            //     });

            Route::prefix('/create-bookmarks')->as('bookmarks.')
                ->middleware([WorkflowMiddleware::class])
                ->group(function () {
                    Route::get('/success', [BookmarksController::class, 'success'])
                        ->name('success');

                    Route::prefix('/steps')
                        ->group(function () {
                            Route::get('/{step}', [BookmarksController::class, 'handleStep'])
                                ->name('index');
                        });

                    Route::post('/save-list', [BookmarksController::class, 'saveList'])
                        ->name('saveList');

                    Route::post('{bookmarkCollection}/add-list-item/', [BookmarksController::class, 'addBookmarkItem'])
                        ->name('addBookmarkItem');

                    Route::post('{bookmarkCollection}/remove-list-item/', [BookmarksController::class, 'removeBookmarkItem'])
                        ->name('removeBookmarkItem');

                    Route::post('{bookmarkCollection}/save-rationales', [BookmarksController::class, 'saveRationales'])
                        ->name('saveRationales');

                    Route::post('{bookmarkCollection}/invite-contributor', [BookmarksController::class, 'inviteContributor'])
                        ->name('inviteContributor');

                    Route::post('{bookmarkCollection}/cancel-invitation', [BookmarksController::class, 'cancelInvitation'])
                        ->name('cancelInvitation');

                    Route::post('{bookmarkCollection}/resend-invitation', [BookmarksController::class, 'resendInvitation'])
                        ->name('resendInvitation');

                    Route::post('{bookmarkCollection}/remove-contributor', [BookmarksController::class, 'removeContributor'])
                        ->name('removeContributor');

            Route::get('/search-users', [BookmarksController::class, 'searchUsers'])
                ->name('searchUsers');
        });

        // Accept invitation routes for bookmark collections
        Route::prefix('/accept-invitation')->as('acceptInvitation.')
            ->group(function () {
                Route::get('/', [BookmarksController::class, 'acceptInvitation'])
                    ->middleware('signed')
                    ->name('index');
                Route::get('/success', [BookmarksController::class, 'acceptInvitationSuccess'])
                    ->name('success');
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
                    Route::post('{catalystDrep}/publish-platform-statement', [CatalystDrepController::class, 'publishPlatformStatementToIpfs'])
                        ->name('publishPlatformStatement');
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
                    Route::post('/save-wallet-name', [SignatureWorkflowController::class, 'saveWalletName'])
                        ->name('saveWalletName');
                });

            Route::prefix('/tinder-proposal/steps')->as('tinderProposal.')
                ->middleware([WorkflowMiddleware::class])
                ->group(function () {
                    Route::post('/1/save', [TinderProposalWorkflowController::class, 'saveStep1'])
                        ->name('saveStep1');
                    Route::post('/2/save', [TinderProposalWorkflowController::class, 'saveStep2'])
                        ->name('saveStep2');
                    Route::post('/3/save', [TinderProposalWorkflowController::class, 'saveStep3'])
                        ->name('saveStep3');
                    Route::post('/add-bookmark-item', [TinderProposalWorkflowController::class, 'addBookmarkItem'])
                        ->name('addBookmarkItem');
                    Route::get('/fetch-proposals', [TinderProposalWorkflowController::class, 'fetchMoreProposals'])
                        ->name('fetchProposals');
                    Route::get('/{step}', [TinderProposalWorkflowController::class, 'handleStep'])
                        ->name('index');
                });

            Route::prefix('/claim-catalyst-profile/steps')->as('claimCatalystProfile.')
                ->middleware([WorkflowMiddleware::class])
                ->group(function () {
                    Route::get('/{step}/{proposal?}', [ClaimCatalystProfileWorkflowController::class, 'handleStep'])
                        ->name('index');
                    Route::post('/validate-wallet/{proposal?}', [ClaimCatalystProfileWorkflowController::class, 'validateWallet'])
                        ->name('validateWallet');
                    Route::post('/sign-wallet/{proposal?}', [ClaimCatalystProfileWorkflowController::class, 'signWallet'])
                        ->name('signWallet');
                    Route::post('/{catalystProfile}/claim-catalyst-profile/{proposal?}', [ClaimCatalystProfileWorkflowController::class, 'claimCatalystProfile'])
                        ->name('claimCatalystProfile');
                });

            Route::prefix('/link-wallet/steps')->as('linkWallet.')
                ->middleware([WorkflowMiddleware::class])
                ->group(function () {
                    Route::get('/{step}/{proposal}/{stakeAddress?}', [WalletController::class, 'handleStep'])
                        ->name('index');
                    Route::post('/connect-wallet-to-proposal', [WalletController::class, 'connectWalletToProposal'])
                        ->name('connectWalletToProposal');    
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
            Route::get('/', fn() => Inertia::render('ComingSoon', ['context' => 'Milestones Lists']))
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

        Route::prefix('lists')->as('lists.')->group(function () {
            Route::get('/', [BookmarksController::class, 'index'])
                ->name('index');
            Route::get('/{bookmarkCollection}/{type}/download-pdf', [BookmarksController::class, 'downloadPdf'])
                ->name('downloadPdf');
            Route::get('/{bookmarkCollection}/{type}/download-png', [BookmarksController::class, 'downloadPng'])
                ->name('downloadPng');
            Route::get('/{bookmarkCollection}/{type?}', [BookmarksController::class, 'view'])
                ->name('view');
            Route::post('/{bookmarkCollection}/stream/{type?}', [BookmarksController::class, 'streamBookmarkItems'])
                ->name('stream');
        });

        Route::prefix('charts')->as('charts.')->group(function () {
            Route::get('/charts', [ChartsController::class, 'index'])
                ->name('index');
            Route::get('/proposals', [ProposalsController::class, 'charts'])
                ->name('proposals');
        });

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
                Route::get('/{stakeKey?}/{catId?}', [WalletController::class, 'show'])
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

        Route::prefix('/active-fund')->as('activeFund.')->group(
            function () {
                Route::get('/', [FundsController::class, 'activeFund'])
                    ->name('index');
            }
        );

        // Dreps
        Route::prefix('/dreps')->as('dreps.')->group(
            function () {
                Route::get('/', [CatalystDrepController::class, 'index'])
                    ->name('index');

                Route::get('/list', [CatalystDrepController::class, 'list'])
                    ->name('list');

                Route::get('/drep/{stake_address}', [CatalystDrepController::class, 'show'])
                    ->name('show');
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

        Route::prefix('/reviewers')->as('reviewers.')->group(function () {
            Route::get('/', fn() => Inertia::render('ComingSoon', ['context' => 'Reviewer List']))
                ->name('index');
            Route::get('/{reviewer}', fn() => Inertia::render('ComingSoon', ['context' => 'Reviewer Page']))
                ->name('view');
        });

        Route::prefix('/reports')->as('reports.')->group(function () {
            Route::get('/', fn() => Inertia::render('ComingSoon', ['context' => 'Reports List']))
                ->name('index');
            Route::get('/{report}', fn() => Inertia::render('ComingSoon', ['context' => 'Report Page']))
                ->name('view');
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

        Route::prefix('/services')->as('services.')->group(function () {
            Route::get('/', [ServiceController::class, 'index'])->name('index');
            Route::get('/{service}', [ServiceController::class, 'show'])->name('show');
        });

        Route::prefix('numbers')->as('numbers.')
            ->group(function () {
                Route::get('/impact', fn() => Inertia::render('ComingSoon', ['context' => 'Impact Numbers']))->name('impact');
                Route::get('/spending', fn() => Inertia::render('ComingSoon', ['context' => 'Spending Numbers']))->name('spending');
                Route::get('/general', fn() => Inertia::render('ComingSoon', ['context' => 'General Numbers']))->name('general');
            });

        Route::prefix('ccv4')->as('ccv4.')
            ->group(function () {
                Route::get('/', fn() => Inertia::render('ComingSoon', ['context' => 'CCV4 Data']))->name('index');
            });

        // Arabic Test Route
        Route::get('/arabic-test', fn() => Inertia::render('ArabicTest'))
            ->name('arabic-test');
    }

);

Route::prefix('language')->as('language.')->group(function () {
    Route::post('/user', [\App\Http\Controllers\UserLanguageController::class, 'updateLanguage'])
        ->middleware('auth')
        ->name('user.update');
    Route::get('/guest', [\App\Http\Controllers\GuestLanguageController::class, 'getCurrentGuestLanguage'])
        ->name('guest.current');
    Route::post('/guest', [\App\Http\Controllers\GuestLanguageController::class, 'updateGuestLanguage'])
        ->name('guest.update');
});

require __DIR__ . '/auth.php';

require __DIR__ . '/dashboard.php';

Route::fallback(FallbackController::class);
