<?php

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

                Route::get('/bookmarks', function () {
                    return Inertia::render('My/Bookmarks/Index');
                })->name('bookmarks');
            })->middleware(['auth', 'verified']);

    }
);
Route::fallback(\CodeZero\LocalizedRoutes\Controllers\FallbackController::class);
