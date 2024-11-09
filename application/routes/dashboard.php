<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/dashboard', function () {
    return Inertia::render('Profile/Dashboard');
})->middleware(['auth', 'verified'])
    ->name('dashboard');
