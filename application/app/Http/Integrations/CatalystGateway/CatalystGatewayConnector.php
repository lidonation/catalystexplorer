<?php

declare(strict_types=1);

namespace App\Http\Integrations\CatalystGateway;

use Saloon\Http\Connector;
use Saloon\Traits\Plugins\AcceptsJson;

class CatalystGatewayConnector extends Connector
{
    use AcceptsJson;

    /**
     * The Base URL of the API
     */
    public function resolveBaseUrl(): string
    {
        return 'https://app.projectcatalyst.io/api/gateway';
    }

    /**
     * Default headers for every request
     */
    protected function defaultHeaders(): array
    {
        return [
            'Accept' => 'application/cbor',
            'User-Agent' => 'CatalystExplorer/1.0',
        ];
    }

    /**
     * Default config options
     */
    protected function defaultConfig(): array
    {
        return [
            'timeout' => 90,
            'connect_timeout' => 30,
        ];
    }
}
