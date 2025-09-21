<?php

declare(strict_types=1);

namespace App\Providers;

use App\Models\Pivot\ClaimedProfile;
use App\Observers\ClaimedProfileObserver;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 5);

        RateLimiter::for('media-update-job', function () {
            return Limit::perMinute(1000);
        });

        // Register model observers
        ClaimedProfile::observe(ClaimedProfileObserver::class);
    }
}
