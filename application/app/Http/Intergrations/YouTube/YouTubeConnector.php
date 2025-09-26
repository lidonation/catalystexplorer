<?php

declare(strict_types=1);

namespace App\Http\Intergrations\YouTube;

use Illuminate\Support\Facades\Cache;
use Saloon\CachePlugin\Contracts\Cacheable;
use Saloon\CachePlugin\Contracts\Driver;
use Saloon\CachePlugin\Drivers\LaravelCacheDriver;
use Saloon\CachePlugin\Traits\HasCaching;
use Saloon\Http\Connector;
use Saloon\Http\PendingRequest;
use Saloon\Http\Request;
use Saloon\Traits\Plugins\AlwaysThrowOnErrors;
use Saloon\Traits\Plugins\HasTimeout;

class YouTubeConnector extends Connector implements Cacheable
{
    use AlwaysThrowOnErrors, HasCaching, HasTimeout;

    protected int $connectTimeout = 10;

    protected int $requestTimeout = 30;

    public function resolveBaseUrl(): string
    {
        return 'https://www.googleapis.com/youtube/v3';
    }

    public function defaultHeaders(): array
    {
        return [
            'Accept' => 'application/json',
        ];
    }

    public function defaultQuery(): array
    {
        return [
            'key' => config('services.youtube.api_key'),
        ];
    }

    /**
     * Define the cache driver to use Laravel's cache system
     */
    public function resolveCacheDriver(): Driver
    {
        return new LaravelCacheDriver(Cache::store('redis'));
    }

    /**
     * Cache all YouTube API responses for 4 hours (14400 seconds)
     */
    public function cacheExpiryInSeconds(): int
    {
        return 14400; // 4 hours
    }

    /**
     * Generate cache key for requests at the connector level
     *
     * Uses SHA-256 for secure, collision-resistant hashing
     * @throws \JsonException
     */
    public function cacheKey(PendingRequest $pendingRequest): string
    {
        $request = $pendingRequest->getRequest();
        $endpoint = $request->resolveEndpoint();
        $queryParams = $request->query()->all();

        unset($queryParams['key']);

        ksort($queryParams);

        $cacheData = json_encode([
            'endpoint' => $endpoint,
            'params' => $queryParams,
        ], JSON_THROW_ON_ERROR);

        // truncated to 32 chars for cache efficiency
        $hash = substr(hash('sha256', $cacheData), 0, 32);

        return 'youtube_api:' . $hash;
    }
}
