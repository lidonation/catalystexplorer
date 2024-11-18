<?php

use App\Http\Controllers\ChartsController;
use App\Http\Controllers\FundsController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\JormungandrController;
use App\Http\Controllers\PeopleController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProposalsController;
use App\Http\Controllers\SearchController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::localized(
    function () {
        Route::get('/', [HomeController::class, 'index'])
            ->name('home');

        Route::get('/proposals', [ProposalsController::class, 'index'])
            ->name('proposals.index');

        Route::get('/funds', [FundsController::class, 'index'])
            ->name('funds.index');


        Route::get('/people', [PeopleController::class, 'index'])
            ->name('people.index');

        Route::get('/charts', [ChartsController::class, 'index'])
            ->name('charts.index');

        Route::get('/jormungandr', [JormungandrController::class, 'index'])
            ->name('jormungandr.index');

        Route::get('/s', [SearchController::class, 'index'])
            ->name('search.index');
    }
);


require __DIR__ . '/auth.php';

require __DIR__ . '/dashboard.php';

Route::fallback(\CodeZero\LocalizedRoutes\Controllers\FallbackController::class);
