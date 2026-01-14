<?php

declare(strict_types=1);

namespace App\Http\Integrations\CatalystReviews;

use Saloon\Http\Connector;
use Saloon\Http\Response;
use Saloon\Traits\Plugins\AcceptsJson;

class CatalystReviewsConnector extends Connector
{
    use AcceptsJson;

    /**
     * The Base URL of the API
     */
    public function resolveBaseUrl(): string
    {
        return 'https://reviews.projectcatalyst.io/api/reviews';
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
     * Configure HTTP client with increased timeout and retry options
     */
    protected function defaultConfig(): array
    {
        return [
            'timeout' => 60,
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
        return 1000;
    }
}
