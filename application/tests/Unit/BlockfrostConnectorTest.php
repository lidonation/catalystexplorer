<?php

declare(strict_types=1);

use App\Http\Intergrations\LidoNation\Blockfrost\BlockfrostConnector;
use App\Http\Intergrations\LidoNation\Blockfrost\Requests\BlockfrostRequest;
use Illuminate\Support\Facades\Config;
use Saloon\Exceptions\SaloonException;
use Tests\TestCase;

class BlockfrostConnectorTest extends TestCase
{
    /** @test */
    public function it_handles_missing_project_id_gracefully(): void
    {
        // Arrange: Remove the project ID configuration
        Config::set('services.blockfrost.project_id', null);

        // Act: Create connector
        $connector = new BlockfrostConnector();

        // Assert: Connector should be marked as not configured
        $this->assertFalse($connector->isConfigured());
        
        // Assert: Authentication should return null
        $this->assertNull($connector->defaultAuth());
        
        // Assert: Headers should not include project_id
        $headers = $connector->defaultHeaders();
        $this->assertArrayNotHasKey('project_id', $headers);
        $this->assertArrayHasKey('Accept', $headers);
        $this->assertEquals('application/json', $headers['Accept']);
    }

    /** @test */
    public function it_throws_exception_when_trying_to_send_request_without_configuration(): void
    {
        // Arrange: Remove the project ID configuration
        Config::set('services.blockfrost.project_id', null);
        
        $connector = new BlockfrostConnector();
        $request = new BlockfrostRequest('/accounts/stake1test');

        // Assert: Should throw SaloonException when trying to send request
        $this->expectException(SaloonException::class);
        $this->expectExceptionMessage('Blockfrost is not configured. Missing BLOCKFROST_PROJECT_ID environment variable.');

        // Act: Try to send request
        $connector->send($request);
    }

    /** @test */
    public function it_works_normally_when_properly_configured(): void
    {
        // Arrange: Set a valid project ID
        Config::set('services.blockfrost.project_id', 'test_project_id_123');

        // Act: Create connector
        $connector = new BlockfrostConnector();

        // Assert: Connector should be marked as configured
        $this->assertTrue($connector->isConfigured());
        
        // Assert: Authentication should return QueryAuthenticator
        $auth = $connector->defaultAuth();
        $this->assertNotNull($auth);
        $this->assertInstanceOf(\Saloon\Http\Auth\QueryAuthenticator::class, $auth);
        
        // Assert: Headers should include project_id
        $headers = $connector->defaultHeaders();
        $this->assertArrayHasKey('project_id', $headers);
        $this->assertEquals('test_project_id_123', $headers['project_id']);
    }
}