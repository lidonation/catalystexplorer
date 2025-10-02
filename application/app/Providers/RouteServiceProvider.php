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
    public function boot(Router $router): void
    {
        // Custom binding for bookmarkCollection to handle authorization manually
        Route::bind('bookmarkCollection', function (string $value) {
            // First try to find with global scopes (for public collections)
            $bookmarkCollection = \App\Models\BookmarkCollection::find($value);

            // If not found with public scope, try without scopes (for private collections that will be authorized later)
            if (! $bookmarkCollection) {
                $bookmarkCollection = \App\Models\BookmarkCollection::withoutGlobalScopes()->find($value);
            }

            // If still not found, return 404
            if (! $bookmarkCollection) {
                abort(404, 'Bookmark collection not found');
            }

            return $bookmarkCollection;
        });
    }
}
