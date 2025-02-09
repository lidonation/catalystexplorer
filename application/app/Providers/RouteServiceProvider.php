<?php

declare(strict_types=1);

namespace App\Providers;

use App\Services\HashIdService;
use Exception;
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
        Route::bind('id', function ($hashId) {
            try {
                return (new HashIdService)->decode($hashId);
            } catch (Exception $e) {
                abort(404, 'No item found with this id!');
            }
        });
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
