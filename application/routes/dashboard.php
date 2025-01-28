<?php

use App\Http\Controllers\My\MyBookmarksController;
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
                    return Inertia::render('Profile/Profile');
                })->name('profile');

                Route::prefix('bookmarks')->as('bookmarks.')
                    ->group(function () {
                        Route::get('/', [MyBookmarksController::class, 'index'])->name('index');
                        Route::post('/', [MyBookmarksController::class, 'create'])->name('create');
                        Route::delete('/', [MyBookmarksController::class, 'delete'])->name('delete');

                        Route::get('/{id}', [MyBookmarksController::class, 'show'])->name('show');
                        Route::get('/collections/{bookmarkCollection}', [MyBookmarksController::class, 'view'])->name('collections.view');
                        Route::delete('/collections', [MyBookmarksController::class, 'deleteCollection'])->name('collections.destroy');
                        Route::delete('/collections', [MyBookmarksController::class, 'deleteFromCollection'])->name('collections.delete');
                    });
            });
    }
);

Route::fallback(\CodeZero\LocalizedRoutes\Controllers\FallbackController::class);
