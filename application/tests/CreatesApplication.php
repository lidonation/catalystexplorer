<?php

namespace Tests;

use Illuminate\Contracts\Console\Kernel;
use Illuminate\Foundation\Application;

trait CreatesApplication
{
    /**
     * Creates the application.
     */
    public function createApplication(): Application
    {
        // Set environment variables for testing before bootstrapping
        $_ENV['APP_ENV'] = 'testing';
        // Use PostgreSQL test database configuration (supports vector extension)
        $_ENV['DB_CONNECTION'] = 'pgsql';
        $_ENV['DB_HOST'] = 'catalystexplorer_test.db';
        $_ENV['DB_PORT'] = '5432';
        $_ENV['DB_DATABASE'] = 'catalystexplorer';
        $_ENV['DB_USERNAME'] = 'explorerdbuser';
        $_ENV['DB_PASSWORD'] = 'ASLJ023470AlserLFH';
        $_ENV['CACHE_DRIVER'] = 'array';
        $_ENV['SESSION_DRIVER'] = 'array';
        $_ENV['QUEUE_CONNECTION'] = 'sync';
        $_ENV['MAIL_MAILER'] = 'array';
        
        $app = require __DIR__.'/../bootstrap/app.php';

        $app->make(Kernel::class)->bootstrap();

        // Double-check configuration after bootstrap (fallback)
        $app['config']->set('app.env', 'testing');
        $app['config']->set('database.default', 'pgsql');
        $app['config']->set('database.connections.pgsql.host', 'catalystexplorer_test.db');
        $app['config']->set('database.connections.pgsql.port', '5432');
        $app['config']->set('database.connections.pgsql.database', 'catalystexplorer');
        $app['config']->set('database.connections.pgsql.username', 'explorerdbuser');
        $app['config']->set('database.connections.pgsql.password', 'ASLJ023470AlserLFH');
        $app['config']->set('cache.default', 'array');
        $app['config']->set('session.driver', 'array');
        $app['config']->set('queue.default', 'sync');
        $app['config']->set('mail.default', 'array');

        return $app;
    }
}