<?php

declare(strict_types=1);

namespace App\Providers;

use App\Models\Proposal;
use Illuminate\Routing\Router;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;

class RouteServiceProvider extends ServiceProvider
{
    /**
     * The path to the "home" route for your application.
     *
     * This is used by Laravel authentication to redirect users after login.
     *
     * @var string
     */
    public const string HOME = '/';

    /**
     * Register services.
     */
    public function register(): void
    {
        // No custom hash ID bindings. Use standard UUID route model binding in routes, e.g.:
        // Route::get('/proposals/{proposal}', ...); // where {proposal} is the UUID primary key.
    }

    /**
     * Bootstrap services.
     */
    public function boot(Router $router): void {}
}
