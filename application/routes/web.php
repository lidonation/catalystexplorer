<?php

use App\Http\Controllers\ChartsController;
use App\Http\Controllers\FundsController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\JormungandrController;
use App\Http\Controllers\IdeascaleProfilesController;
use App\Http\Controllers\VoterToolController;
use App\Http\Controllers\ProposalsController;
use App\Http\Controllers\SearchController;
use Illuminate\Support\Facades\Route;

Route::localized(
    function () {
        Route::get('/', [HomeController::class, 'index'])
            ->name('home');

        Route::get('/proposals', [ProposalsController::class, 'index'])
            ->name('proposals.index');

        Route::get('/funds', [FundsController::class, 'index'])
            ->name('funds.index');

        Route::get('/ideascale-profiles', [IdeascaleProfilesController::class, 'index'])
            ->name('ideascaleProfiles.index');

        Route::get('/charts', [ChartsController::class, 'index'])
            ->name('charts.index');

        Route::get('/jormungandr', [JormungandrController::class, 'index'])
            ->name('jormungandr.index');

        Route::get('/voter-tool', [VoterToolController::class, 'index'])
            ->name('voter-tool.index');

        Route::get('/s', [SearchController::class, 'index'])
            ->name('search.index');
    }
);


require __DIR__ . '/auth.php';

require __DIR__ . '/dashboard.php';

require __DIR__ . '/api.php';

Route::fallback(\CodeZero\LocalizedRoutes\Controllers\FallbackController::class);
