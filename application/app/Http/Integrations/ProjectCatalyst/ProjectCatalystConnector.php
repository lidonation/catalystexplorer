<?php

declare(strict_types=1);

namespace App\Http\Integrations\ProjectCatalyst;

use Saloon\Http\Connector;
use Saloon\Traits\Plugins\AcceptsJson;
use Saloon\Traits\Plugins\AlwaysThrowOnErrors;

class ProjectCatalystConnector extends Connector
{
    use AcceptsJson, AlwaysThrowOnErrors;

    /**
     * The Base URL of the API
     */
    public function resolveBaseUrl(): string
    {
        return 'https://projectcatalyst.io/api/v1';
    }

    /**
     * Default headers for every request
     */
    protected function defaultHeaders(): array
    {
        return [
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
        ];
    }

    /**
     * Default config
     */
    protected function defaultConfig(): array
    {
        return [
            'timeout' => 60,
        ];
    }
}
