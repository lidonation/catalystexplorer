<?php

use App\Http\Controllers\BookmarksController;
use App\Http\Controllers\My\MyBookmarksController;
use App\Http\Controllers\ProposalsController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\GroupsController;
use App\Http\Controllers\ReviewsController;
use App\Http\Controllers\WalletController;
use App\Http\Controllers\VoterHistoriesController;
use App\Http\Controllers\ServiceController;
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
                    Route::get('/{bookmarkCollection}/manage/{type?}', [BookmarksController::class, 'manage'])
                        ->name('manage');
                    Route::post('/{bookmarkCollection}/manage/stream/{type?}', [BookmarksController::class, 'streamBookmarkItems'])
                        ->name('manage.stream');
                });

                Route::get('/transactions', [TransactionController::class, 'userTransaction'])->name('transactions');

                Route::get('/profile', [ProfileController::class, 'edit'])->name('profile');

                Route::prefix('proposals')->as('proposals.')->group(function () {
                    Route::get('/', [ProposalsController::class, 'myProposals'])->name('index');
                    Route::get('/{proposal}/manage', [ProposalsController::class, 'manageProposal'])->name('manage');
                    Route::patch('/{proposal}/update-quick-pitch', [ProposalsController::class, 'updateQuickPitch'])->name('quickpitch.update');
                    Route::patch('/{proposal}/delete-quick-pitch', [ProposalsController::class, 'deleteQuickPitch'])->name('quickpitch.delete');
                });

                Route::get('/reviews', [ProfileController::class, 'myReviews'])->name('reviews');
                Route::get('/wallets', [WalletController::class, 'index'])
                            ->name('wallets');
                Route::get('/services', [ServiceController::class, 'myServices'])
                            ->name('services');
                Route::get('/wallets/{stakeKey}', [WalletController::class, 'show'])
                        ->name('wallets.show');
                Route::patch('/wallets/{walletId}', [WalletController::class, 'update'])
                        ->name('wallets.update');
                Route::delete('/wallets/{stakeAddress}', [WalletController::class, 'destroy'])
                        ->name('wallets.destroy');
            });
    }
);

Route::fallback(\CodeZero\LocalizedRoutes\Controllers\FallbackController::class);
