<?php

use App\Interfaces\Http\Controllers\My\MyBookmarksController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::localized(
    function () {
        Route::prefix('my')->as('my.')
            ->group(function () {
                Route::get('/dashboard', function () {
                    return Inertia::render('Profile/Dashboard');
                })->name('dashboard');

                Route::get('/profile', function () {
                    return Inertia::render('Profile/Dashboard');
                })->name('profile');

                Route::get('/proposals', function () {
                    return Inertia::render('Profile/Dashboard');
                })->name('proposals');

                Route::get('/reviews', function () {
                    return Inertia::render('Profile/Dashboard');
                })->name('reviews');

                Route::get('/groups', function () {
                    return Inertia::render('Profile/Dashboard');
                })->name('groups');

                Route::get('/communities', function () {
                    return Inertia::render('Profile/Dashboard');
                })->name('communities');

                Route::get('/list', function () {
                    return Inertia::render('Profile/Dashboard');
                })->name('list');

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
            });
    }
);

Route::fallback(\CodeZero\LocalizedRoutes\Controllers\FallbackController::class);
