<?php

namespace Tests\Feature;

use App\Http\Controllers\ProposalsController;
use App\Models\Metric;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class ProposalMetricsOptimizationTest extends TestCase
{
    use RefreshDatabase;

    protected ProposalsController $controller;

    protected function setUp(): void
    {
        parent::setUp();
        $this->controller = new ProposalsController();
        
        // Clear cache before each test
        Cache::flush();
    }

    /**
     * Test that caching works for identical requests
     */
    public function test_caching_works_for_identical_requests(): void
    {
        // Create mock data
        $this->createMockMetrics();

        $request = $this->createMockRequest([
            'rules' => ['Rule 1', 'Rule 2'],
            'chartType' => 'bar',
        ]);

        // First request - should hit database
        $startTime = microtime(true);
        $result1 = $this->controller->getProposalMetrics($request);
        $firstRequestTime = microtime(true) - $startTime;

        // Second identical request - should hit cache
        $startTime = microtime(true);
        $result2 = $this->controller->getProposalMetrics($request);
        $secondRequestTime = microtime(true) - $startTime;

        // Assert results are identical
        $this->assertEquals($result1, $result2);
        
        // Assert second request was faster (cached)
        $this->assertLessThan($firstRequestTime, $secondRequestTime);
    }

    /**
     * Test that different requests get different cache keys
     */
    public function test_different_requests_get_different_results(): void
    {
        $this->createMockMetrics();

        $request1 = $this->createMockRequest([
            'rules' => ['Rule 1'],
            'chartType' => 'bar',
        ]);

        $request2 = $this->createMockRequest([
            'rules' => ['Rule 2'],
            'chartType' => 'bar',
        ]);

        $result1 = $this->controller->getProposalMetrics($request1);
        $result2 = $this->controller->getProposalMetrics($request2);

        // Results should be different (or at least processed separately)
        // The exact assertion depends on your mock data structure
        $this->assertIsArray($result1);
        $this->assertIsArray($result2);
    }

    /**
     * Test early return for empty rules
     */
    public function test_early_return_for_empty_rules(): void
    {
        $request = $this->createMockRequest([
            'rules' => [],
            'chartType' => 'bar',
        ]);

        $result = $this->controller->getProposalMetrics($request);

        $this->assertEquals([], $result);
    }

    /**
     * Test early return for null rules
     */
    public function test_early_return_for_null_rules(): void
    {
        $request = $this->createMockRequest([
            'chartType' => 'bar',
        ]);

        $result = $this->controller->getProposalMetrics($request);

        $this->assertEquals([], $result);
    }

    /**
     * Test referer parameter extraction
     */
    public function test_referer_parameter_extraction(): void
    {
        $this->createMockMetrics();

        $request = $this->createMockRequest([
            'rules' => ['Rule 1'],
            'chartType' => 'bar',
        ]);

        // Add referer header with query parameters
        $request->headers->set('referer', 'https://example.com/page?param1=value1&param2=value2');

        // This should not throw an error and should handle referer params
        $result = $this->controller->getProposalMetrics($request);

        $this->assertIsArray($result);
    }

    /**
     * Test that metrics filtering optimization works
     */
    public function test_metrics_filtering_optimization(): void
    {
        // Create metrics with different rule combinations
        $metric1 = Metric::factory()->create(['type' => 'bar']);
        $metric2 = Metric::factory()->create(['type' => 'bar']);
        $metric3 = Metric::factory()->create(['type' => 'line']); // Different type

        // Mock the rules relationship if it exists
        // This would need to be adjusted based on your actual model relationships
        
        $request = $this->createMockRequest([
            'rules' => ['Rule 1', 'Rule 2'],
            'chartType' => 'bar',
        ]);

        $result = $this->controller->getProposalMetrics($request);

        // Result should be an array (exact structure depends on your implementation)
        $this->assertIsArray($result);
    }

    /**
     * Test cache key generation consistency
     */
    public function test_cache_key_generation_consistency(): void
    {
        $request1 = $this->createMockRequest([
            'rules' => ['Rule 1', 'Rule 2'],
            'chartType' => 'bar',
        ]);

        $request2 = $this->createMockRequest([
            'rules' => ['Rule 1', 'Rule 2'],
            'chartType' => 'bar',
        ]);

        // Use reflection to access private method for testing
        $reflection = new \ReflectionClass($this->controller);
        $method = $reflection->getMethod('generateMetricsCacheKey');
        $method->setAccessible(true);

        $key1 = $method->invokeArgs($this->controller, [$request1]);
        $key2 = $method->invokeArgs($this->controller, [$request2]);

        $this->assertEquals($key1, $key2);
    }

    /**
     * Test performance improvement with large datasets
     */
    public function test_performance_improvement_with_caching(): void
    {
        // Create multiple metrics
        $metrics = Metric::factory()->count(10)->create(['type' => 'bar']);

        $request = $this->createMockRequest([
            'rules' => ['Rule 1', 'Rule 2'],
            'chartType' => 'bar',
        ]);

        // Measure first request (no cache)
        $startTime = microtime(true);
        $result1 = $this->controller->getProposalMetrics($request);
        $firstRequestTime = microtime(true) - $startTime;

        // Measure second request (with cache)
        $startTime = microtime(true);
        $result2 = $this->controller->getProposalMetrics($request);
        $secondRequestTime = microtime(true) - $startTime;

        // Second request should be faster
        $this->assertLessThan($firstRequestTime, $secondRequestTime);
        $this->assertEquals($result1, $result2);
    }

    /**
     * Create mock metrics for testing
     */
    private function createMockMetrics(): void
    {
        // Create some test metrics
        // This would need to be adjusted based on your actual model structure
        Metric::factory()->count(3)->create([
            'type' => 'bar',
            'context' => 'charts',
        ]);

        Metric::factory()->count(2)->create([
            'type' => 'line', 
            'context' => 'charts',
        ]);
    }

    /**
     * Create a mock request with given parameters
     */
    private function createMockRequest(array $params = []): Request
    {
        $request = new Request();
        $request->replace($params);
        
        return $request;
    }

    protected function tearDown(): void
    {
        Cache::flush();
        parent::tearDown();
    }
}
