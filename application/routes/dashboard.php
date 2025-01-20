<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\My\MyBookmarksController;
use Inertia\Inertia;

Route::localized(
    function () {
        Route::prefix('my')->as('my.')
            ->group(function () {
                Route::get('/dashboard', function () {
                    return Inertia::render('Profile/Dashboard');
                })->name('dashboard');

                Route::get('/profile', function () {
                    return Inertia::render('Profile/Profile');
                })->name('profile');

                Route::prefix('bookmarks')->as('bookmarks.')
                    ->group(function () {
                        Route::get('/', [MyBookmarksController::class, 'index'])->name('index');
                        Route::get('/{id}', [MyBookmarksController::class, 'show'])->name('show');
                        Route::post('/create-item', [MyBookmarksController::class, 'createItem'])->name('create-item');
                        Route::get('/collections/{bookmarkCollection}', [MyBookmarksController::class, 'view'])->name('collections.view');
                        Route::get('/{type}', [MyBookmarksController::class, 'getBookmarksByType'])->name('type');
                        Route::delete('/collections', [MyBookmarksController::class, 'deleteCollection'])->name('collections.destroy');
                        Route::delete('/proposals', [MyBookmarksController::class, 'deleteFromCollection'])->name('proposals.delete');
                    });
            });
    }
);

Route::fallback(\CodeZero\LocalizedRoutes\Controllers\FallbackController::class);
