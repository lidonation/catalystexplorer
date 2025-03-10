<?php

use App\Http\Controllers\My\MyBookmarksController;
use App\Http\Controllers\ProfileController;
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

                Route::get('/communities', function () {
                    return Inertia::render('My/Communities/Index');
                })->name('communities');

                Route::get('/dashboard', function () {
                    return Inertia::render('My/Dashboard');
                })->name('dashboard');

                Route::get('/groups', function () {
                    return Inertia::render('My/Groups/Index');
                })->name('groups');

                Route::get('/lists', function () {
                    return Inertia::render('My/Lists/Index');
                })->name('lists');

                Route::get('/profile', [ProfileController::class, 'edit'])
                    ->name('profile');

                Route::get('/proposals', function () {
                    return Inertia::render('My/Proposals/Index');
                })->name('proposals');

                Route::get('/reviews', function () {
                    return Inertia::render('My/Reviews/Index');
                })->name('reviews');
            });
    }
);

Route::fallback(\CodeZero\LocalizedRoutes\Controllers\FallbackController::class);
