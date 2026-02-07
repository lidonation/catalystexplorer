<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Pgvector\Laravel\Schema;

class CustomPgvectorServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        Schema::register();

        $this->publishes([
            base_path('vendor/pgvector/pgvector/src/laravel/migrations') => database_path('migrations')
        ], 'pgvector-migrations');
    }
}
