<?php

namespace Tests;

use Illuminate\Contracts\Console\Kernel;
use Illuminate\Foundation\Application;

trait CreatesApplicationWithoutDatabase
{
    /**
     * Creates the application without any database setup.
     */
    public function createApplication(): Application
    {
        // Set environment variables for testing before bootstrapping
        $_ENV['APP_ENV'] = 'testing';
        $_ENV['DB_CONNECTION'] = 'sqlite';
        $_ENV['DB_DATABASE'] = ':memory:';
        $_ENV['CACHE_DRIVER'] = 'array';
        $_ENV['SESSION_DRIVER'] = 'array';
        $_ENV['QUEUE_CONNECTION'] = 'sync';
        $_ENV['MAIL_MAILER'] = 'array';
        
        $app = require __DIR__.'/../bootstrap/app.php';

        // Skip bootstrap to avoid loading providers and migrations
        // Only do minimal setup for architecture tests
        
        // Set basic configuration without fully bootstrapping
        $app['config']->set('app.env', 'testing');
        $app['config']->set('database.default', 'sqlite');
        $app['config']->set('database.connections.sqlite.database', ':memory:');
        $app['config']->set('cache.default', 'array');
        
        // Don't call $app->make(Kernel::class)->bootstrap(); to avoid migrations
        
        return $app;
    }
}