<?php

declare(strict_types=1);

namespace App\Http\Intergrations\YouTube\Examples;

/**
 * Comparison between MD5 and SHA-256 for cache key generation
 */
class HashingComparison
{
    /**
     * Generate cache key using the old MD5 method (deprecated)
     */
    private static function generateMD5CacheKey(string $endpoint, array $queryParams): string
    {
        unset($queryParams['key']); // Remove API key
        ksort($queryParams);
        return 'youtube_api:' . md5($endpoint . serialize($queryParams));
    }

    /**
     * Generate cache key using the new SHA-256 method
     */
    private static function generateSHA256CacheKey(string $endpoint, array $queryParams): string
    {
        unset($queryParams['key']); // Remove API key
        ksort($queryParams);
        
        // Use the same method as the connector
        $cacheData = json_encode([
            'endpoint' => $endpoint,
            'params' => $queryParams,
        ], JSON_THROW_ON_ERROR);
        
        $hash = substr(hash('sha256', $cacheData), 0, 32);
        return 'youtube_api:' . $hash;
    }

    /**
     * Compare both hashing methods
     */
    public static function compareHashingMethods(): array
    {
        $testCases = [
            [
                'endpoint' => '/videos',
                'params' => ['part' => 'contentDetails,snippet,statistics', 'id' => 'abc123']
            ],
            [
                'endpoint' => '/search',
                'params' => ['part' => 'snippet', 'q' => 'laravel tutorial', 'maxResults' => 25]
            ],
            [
                'endpoint' => '/channels',
                'params' => ['part' => 'snippet,statistics', 'id' => 'UC123456789']
            ]
        ];

        $results = [];

        foreach ($testCases as $index => $testCase) {
            $endpoint = $testCase['endpoint'];
            $params = $testCase['params'];

            $md5Key = self::generateMD5CacheKey($endpoint, $params);
            $sha256Key = self::generateSHA256CacheKey($endpoint, $params);

            $results["test_case_$index"] = [
                'endpoint' => $endpoint,
                'params' => $params,
                'md5_key' => $md5Key,
                'sha256_key' => $sha256Key,
                'md5_length' => strlen($md5Key),
                'sha256_length' => strlen($sha256Key),
                'md5_hash_part' => substr($md5Key, strlen('youtube_api:')),
                'sha256_hash_part' => substr($sha256Key, strlen('youtube_api:')),
            ];
        }

        // Analysis
        $results['analysis'] = [
            'md5_security' => 'DEPRECATED - Vulnerable to collision attacks',
            'sha256_security' => 'SECURE - Cryptographically strong, collision resistant',
            'md5_hash_length' => 32, // characters
            'sha256_hash_length' => 32, // characters (truncated from 64)
            'sha256_entropy_bits' => 128, // 128 bits of entropy (32 hex chars)
            'collision_probability' => '2^-128 (astronomically low)',
            'performance_impact' => 'Negligible - SHA-256 is fast enough for cache keys',
            'cache_key_compatibility' => 'Same length, compatible with all cache stores'
        ];

        return $results;
    }

    /**
     * Demonstrate collision resistance
     */
    public static function demonstrateCollisionResistance(): array
    {
        // Create similar but different inputs that might cause MD5 collisions
        $testInputs = [
            ['endpoint' => '/videos', 'params' => ['id' => 'abc123', 'part' => 'snippet']],
            ['endpoint' => '/videos', 'params' => ['id' => 'abc124', 'part' => 'snippet']],
            ['endpoint' => '/videos', 'params' => ['id' => 'abc123', 'part' => 'statistics']],
        ];

        $md5Keys = [];
        $sha256Keys = [];

        foreach ($testInputs as $input) {
            $md5Keys[] = self::generateMD5CacheKey($input['endpoint'], $input['params']);
            $sha256Keys[] = self::generateSHA256CacheKey($input['endpoint'], $input['params']);
        }

        return [
            'test_inputs' => $testInputs,
            'md5_keys' => $md5Keys,
            'sha256_keys' => $sha256Keys,
            'md5_all_unique' => count($md5Keys) === count(array_unique($md5Keys)),
            'sha256_all_unique' => count($sha256Keys) === count(array_unique($sha256Keys)),
            'recommendation' => 'Use SHA-256 for security and future-proofing'
        ];
    }

    /**
     * Performance comparison (basic)
     */
    public static function performanceComparison(): array
    {
        $endpoint = '/videos';
        $params = ['part' => 'contentDetails,snippet,statistics', 'id' => 'test123'];
        $iterations = 1000;

        // Test MD5 performance
        $start = microtime(true);
        for ($i = 0; $i < $iterations; $i++) {
            self::generateMD5CacheKey($endpoint, $params);
        }
        $md5Time = microtime(true) - $start;

        // Test SHA-256 performance
        $start = microtime(true);
        for ($i = 0; $i < $iterations; $i++) {
            self::generateSHA256CacheKey($endpoint, $params);
        }
        $sha256Time = microtime(true) - $start;

        return [
            'iterations' => $iterations,
            'md5_total_time' => round($md5Time * 1000, 3) . 'ms',
            'sha256_total_time' => round($sha256Time * 1000, 3) . 'ms',
            'md5_per_operation' => round(($md5Time / $iterations) * 1000000, 3) . 'μs',
            'sha256_per_operation' => round(($sha256Time / $iterations) * 1000000, 3) . 'μs',
            'performance_difference' => round((($sha256Time - $md5Time) / $md5Time) * 100, 1) . '%',
            'conclusion' => 'SHA-256 overhead is negligible for cache key generation'
        ];
    }

    /**
     * Run all comparisons
     */
    public static function runAllComparisons(): array
    {
        return [
            'hashing_comparison' => self::compareHashingMethods(),
            'collision_resistance' => self::demonstrateCollisionResistance(),
            'performance' => self::performanceComparison(),
            'recommendation' => [
                'algorithm' => 'SHA-256 (truncated to 32 chars)',
                'security' => 'High - collision resistant',
                'performance' => 'Excellent - minimal overhead',
                'cache_compatibility' => 'Perfect - same key length as MD5',
                'future_proof' => 'Yes - industry standard'
            ]
        ];
    }
}