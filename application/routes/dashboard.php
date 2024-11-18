<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::localized(
    function () {
        Route::get('/dashboard', function () {
            return Inertia::render('Profile/Dashboard');
        })->middleware(['auth', 'verified'])
            ->name('dashboard');
    }
);
Route::fallback(\CodeZero\LocalizedRoutes\Controllers\FallbackController::class);
