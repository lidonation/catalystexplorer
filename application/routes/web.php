<?php

use App\Http\Controllers\ChartsController;
use App\Http\Controllers\FundsController;
use App\Http\Controllers\Jormungandr;
use App\Http\Controllers\PeopleController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProposalsController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', []);
});

Route::get('/proposals',[ProposalsController::class, 'index'])
    ->name('proposals.index');

Route::get('/funds',[FundsController::class, 'index'])
    ->name('funds.index');


Route::get('/people',[PeopleController::class, 'index'])
    ->name('people.index');

Route::get('/charts',[ChartsController::class, 'index'])
    ->name('charts.index');

Route::get('/jormungandr',[Jormungandr::class, 'index'])
    ->name('jormungandr.index');

Route::get('/s', function () {
    return Inertia::render('SearchResults', []);
});

require __DIR__.'/auth.php';

require __DIR__.'/dashboard.php';
