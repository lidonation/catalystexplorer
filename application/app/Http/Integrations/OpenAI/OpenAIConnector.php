<?php

declare(strict_types=1);

namespace App\Http\Integrations\OpenAI;

use Saloon\Http\Auth\TokenAuth;
use Saloon\Http\Connector;
use Saloon\Traits\Plugins\AcceptsJson;
use Saloon\Traits\Plugins\AlwaysThrowOnErrors;

class OpenAIConnector extends Connector
{
    use AcceptsJson, AlwaysThrowOnErrors;

    public function __construct(private string $apiKey) {}

    /**
     * The Base URL of the API
     */
    public function resolveBaseUrl(): string
    {
        return 'https://api.openai.com/v1';
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
     * Default HTTP client options
     */
    protected function defaultConfig(): array
    {
        return [
            'timeout' => 60,
            'connect_timeout' => 10,
        ];
    }

    /**
     * Define the authentication for the connector
     */
    protected function defaultAuth(): TokenAuth
    {
        return new TokenAuth($this->apiKey);
    }
}
