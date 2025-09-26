<?php

declare(strict_types=1);

namespace App\Http\Intergrations\YouTube\Requests;

use App\Http\Intergrations\YouTube\YouTubeConnector;
use Saloon\CachePlugin\Contracts\Cacheable;
use Saloon\CachePlugin\Contracts\Driver;
use Saloon\CachePlugin\Traits\HasCaching;
use Saloon\Enums\Method;
use Saloon\Http\Connector;
use Saloon\Http\Request;
use Saloon\Traits\Request\HasConnector;

class GetVideoDetailsRequest extends Request implements Cacheable
{
    use HasCaching, HasConnector;

    protected Method $method = Method::GET;

    public function __construct(
        private string $videoId
    ) {}

    public function resolveConnector(): Connector
    {
        return app(YouTubeConnector::class);
    }

    public function resolveEndpoint(): string
    {
        return '/videos';
    }

    public function defaultQuery(): array
    {
        return [
            'part' => 'contentDetails,snippet,statistics',
            'id' => $this->videoId,
        ];
    }

    /**
     * Generate a unique cache key for this video request
     */
    public function cacheKey(): string
    {
        return 'youtube_video_details_'.$this->videoId;
    }

    /**
     * Cache this request for 4 hours
     */
    public function cacheExpiryInSeconds(): int
    {
        return 14400; // 4 hours
    }

    /**
     * Use the connector's cache driver
     */
    public function resolveCacheDriver(): Driver
    {
        return $this->resolveConnector()->resolveCacheDriver();
    }

    /**
     * Get the video ID for this request (useful for debugging/logging)
     */
    public function getVideoId(): string
    {
        return $this->videoId;
    }
}
