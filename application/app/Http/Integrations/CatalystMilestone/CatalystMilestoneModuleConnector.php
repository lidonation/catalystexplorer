<?php

declare(strict_types=1);

namespace App\Http\Integrations\CatalystMilestone;

use Saloon\Http\Connector;
use Saloon\Http\Response;

class CatalystMilestoneModuleConnector extends Connector
{
    public function resolveBaseUrl(): string
    {
        return 'https://hutbpqoulajxnzwykvrf.supabase.co/rest';
    }

    public function defaultHeaders(): array
    {
        return [
            'ApiKey' => config('services.catalystMilestone.key'),
        ];
    }

    /**
     * Configure HTTP client with increased timeout and retry options
     */
    protected function defaultConfig(): array
    {
        return [
            'timeout' => 30,
            'connect_timeout' => 10,
        ];
    }

    /**
     * Determine if a request should be retried based on response
     */
    public function hasRequestFailed(Response $response): bool
    {
        return $response->serverError() || $response->status() === 429;
    }

    /**
     * Determine how many times to retry a failed request
     */
    public function retryAttempts(): int
    {
        return 3;
    }

    /**
     * Calculate the delay between retry attempts (exponential backoff)
     */
    public function retryInterval(): int
    {
        // Start with 1 seconds, doubles each retry
        return 1000;
    }
}
