<?php

declare(strict_types=1);

namespace App\Http\Intergrations\YouTube\Tests;

use App\Http\Intergrations\YouTube\Requests\GetVideoDetailsRequest;
use App\Http\Intergrations\YouTube\YouTubeConnector;
use Illuminate\Support\Facades\Cache;

/**
 * Simple test to verify YouTube API caching is working
 *
 * This is not a PHPUnit test, just a simple verification script
 */
class CacheTest
{
    /**
     * Test that the cache implementation is working
     */
    public static function testCacheImplementation(): array
    {
        $results = [];

        // Test 1: Verify interfaces are implemented
        $connector = new YouTubeConnector;
        $request = new GetVideoDetailsRequest('test-video-id');

        $results['connector_implements_cacheable'] = $connector instanceof \Saloon\CachePlugin\Contracts\Cacheable;
        $results['request_implements_cacheable'] = $request instanceof \Saloon\CachePlugin\Contracts\Cacheable;

        // Test 2: Verify required methods exist
        $results['connector_has_cache_driver'] = method_exists($connector, 'resolveCacheDriver');
        $results['connector_has_cache_expiry'] = method_exists($connector, 'cacheExpiryInSeconds');
        $results['connector_has_cache_key'] = method_exists($connector, 'cacheKey');

        $results['request_has_cache_driver'] = method_exists($request, 'resolveCacheDriver');
        $results['request_has_cache_expiry'] = method_exists($request, 'cacheExpiryInSeconds');
        $results['request_has_cache_key'] = method_exists($request, 'cacheKey');

        // Test 3: Verify method return values
        try {
            $results['connector_cache_expiry'] = $connector->cacheExpiryInSeconds();
            $results['request_cache_expiry'] = $request->cacheExpiryInSeconds();
            $results['request_cache_key'] = $request->cacheKey();
            $results['connector_cache_key'] = $connector->cacheKey($request);

            // Test cache driver
            $driver = $connector->resolveCacheDriver();
            $results['cache_driver_type'] = get_class($driver);
            $results['cache_driver_is_laravel'] = $driver instanceof \Saloon\CachePlugin\Drivers\LaravelCacheDriver;

        } catch (\Exception $e) {
            $results['error'] = $e->getMessage();
        }

        // Test 4: Check if cache is accessible
        try {
            $testKey = 'youtube_cache_test_'.time();
            $testValue = ['test' => true, 'timestamp' => time()];

            Cache::put($testKey, $testValue, 60);
            $retrieved = Cache::get($testKey);

            $results['cache_store_works'] = $retrieved === $testValue;

            // Clean up
            Cache::forget($testKey);

        } catch (\Exception $e) {
            $results['cache_error'] = $e->getMessage();
        }

        return $results;
    }

    /**
     * Test cache key generation
     */
    public static function testCacheKeyGeneration(): array
    {
        $results = [];

        $connector = new YouTubeConnector;

        // Test different video IDs generate different keys
        $request1 = new GetVideoDetailsRequest('video-123');
        $request2 = new GetVideoDetailsRequest('video-456');

        $key1 = $request1->cacheKey();
        $key2 = $request2->cacheKey();

        // For connector cache keys, we need to create PendingRequest objects
        $pendingRequest1 = $connector->createPendingRequest($request1);
        $pendingRequest2 = $connector->createPendingRequest($request2);
        $connectorKey1 = $connector->cacheKey($pendingRequest1);
        $connectorKey2 = $connector->cacheKey($pendingRequest2);

        $results['request_keys_different'] = $key1 !== $key2;
        $results['connector_keys_different'] = $connectorKey1 !== $connectorKey2;
        $results['request_key_format'] = str_starts_with($key1, 'youtube_video_details_');
        $results['connector_key_format'] = str_starts_with($connectorKey1, 'youtube_api:');

        // Test that connector keys use SHA-256 (32 char truncated hash after prefix)
        $hashPart1 = substr($connectorKey1, strlen('youtube_api:'));
        $hashPart2 = substr($connectorKey2, strlen('youtube_api:'));
        $results['connector_hash_length'] = strlen($hashPart1) === 32;
        $results['connector_hash_is_hex'] = ctype_xdigit($hashPart1);
        $results['connector_hashes_different'] = $hashPart1 !== $hashPart2;

        $results['sample_request_key'] = $key1;
        $results['sample_connector_key'] = $connectorKey1;

        return $results;
    }

    /**
     * Run all tests and return results
     */
    public static function runAllTests(): array
    {
        return [
            'cache_implementation' => self::testCacheImplementation(),
            'cache_key_generation' => self::testCacheKeyGeneration(),
            'test_timestamp' => now()->toISOString(),
        ];
    }
}
