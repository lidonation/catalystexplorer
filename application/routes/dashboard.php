<?php

use App\Http\Controllers\My\MyBookmarksController;
use App\Http\Controllers\ProposalsController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\GroupsController;
use App\Http\Controllers\ReviewsController;
use App\Http\Controllers\WalletController;
use App\Http\Controllers\VoterHistoriesController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::localized(
    function () {
        Route::prefix('my')->as('my.')
            ->middleware(['auth'])
            ->group(function () {
                Route::prefix('bookmarks')->as('bookmarks.')
                    ->group(function () {
                        Route::get('/', [MyBookmarksController::class, 'index'])
                            ->name('index');
                        Route::post('/', [MyBookmarksController::class, 'create'])
                            ->name('create');
                        Route::delete('/', [MyBookmarksController::class, 'delete'])
                            ->name('delete');
                        Route::get('/show', [MyBookmarksController::class, 'show'])
                            ->name('show');
                        Route::prefix('/collections')->as('collections.')
                            ->group(function () {
                                Route::get('/', [MyBookmarksController::class, 'collectionIndex'])
                                    ->name('index');
                                Route::post('/', [MyBookmarksController::class, 'createCollection'])
                                    ->name('create');
                                Route::delete('/', [MyBookmarksController::class, 'deleteCollection'])
                                    ->name('destroy');
                            });
                    });

                Route::get('/communities', [ProfileController::class, 'userCommunities'])->name('communities');

                Route::get('/dashboard', [ProfileController::class, 'userSummary'])->name('dashboard');

                Route::get('/groups', [GroupsController::class, 'myGroups'])->name('groups');
                Route::get('/votes', [VoterHistoriesController::class, 'myVotes'])->name('votes');

                Route::prefix('lists')->name('lists.')->group(function () {
                    Route::get('/', [MyBookmarksController::class, 'collectionIndex'])->name('index');
                    Route::get('/{list}', [MyBookmarksController::class, 'showCollection'])->name('show');
                });

                Route::get('/transactions', [TransactionController::class, 'userTransaction'])->name('transactions');

                Route::get('/profile', function () {
                    return Inertia::render('My/Profile/Index');
                })->name('profile');

                Route::prefix('proposals')->as('proposals.')->group(function () {
                    Route::get('/', [ProposalsController::class, 'myProposals'])->name('index');
                    Route::get('/{proposal}/manage', function () {
                        return Inertia::render('My/Proposals/ManageProposal');
                    })->name('manage');
                });

                Route::get('/reviews', [ProfileController::class, 'myReviews'])->name('reviews');
                Route::get('/wallets', [WalletController::class, 'index'])
                            ->name('wallets');
                Route::get('/wallets/{stakeKey}/{catId}', [WalletController::class, 'show'])
                        ->name('wallets.show');
                Route::delete('/wallets/{stakeAddress}', [WalletController::class, 'destroy'])
                        ->name('wallets.destroy');
            });
    }
);

Route::fallback(\CodeZero\LocalizedRoutes\Controllers\FallbackController::class);
