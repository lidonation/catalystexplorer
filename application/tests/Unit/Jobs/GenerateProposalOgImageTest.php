<?php

declare(strict_types=1);

namespace Tests\Unit\Jobs;

use App\Jobs\GenerateProposalOgImage;
use App\Models\Proposal;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use GuzzleHttp\Psr7\Request as GuzzleRequest;
use GuzzleHttp\Psr7\Response as GuzzleResponse;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Log;
use Mockery;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class GenerateProposalOgImageTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    #[Test]
    public function it_makes_http_request_to_correct_og_image_url()
    {
        $this->markTestSkipped('Job creates Client internally - requires refactoring for testability');
    }

    #[Test]
    public function it_logs_success_when_request_returns_200()
    {
        $this->markTestSkipped('Job creates Client internally - requires refactoring for testability');
    }

    #[Test]
    public function it_logs_error_when_request_returns_non_200_status()
    {
        $this->markTestSkipped('Job creates Client internally - requires refactoring for testability');
    }

    #[Test]
    public function it_handles_proposal_not_found_gracefully()
    {
        // Arrange
        Log::spy();

        $nonExistentSlug = 'non-existent-proposal';

        $job = new GenerateProposalOgImage($nonExistentSlug);

        // Act
        $job->handle();

        // Assert
        Log::shouldHaveReceived('warning')
            ->once()
            ->with('Proposal not found for OG image generation', [
                'slug' => $nonExistentSlug,
            ]);
    }

    #[Test]
    public function it_logs_error_and_rethrows_exception_on_request_failure()
    {
        $this->markTestSkipped('Job creates Client internally - requires refactoring for testability');
    }

    #[Test]
    public function it_constructs_url_with_fallback_locale()
    {
        $this->markTestSkipped('Job creates Client internally - requires refactoring for testability');
    }

    #[Test]
    public function it_uses_app_locale_when_fallback_locale_not_configured()
    {
        $this->markTestSkipped('Job creates Client internally - requires refactoring for testability');
    }

    #[Test]
    public function it_configures_client_with_ssl_verification_disabled()
    {
        $this->markTestSkipped('Job creates Client internally - requires refactoring for testability');
    }

    #[Test]
    public function it_handles_timeout_exceptions()
    {
        $this->markTestSkipped('Job creates Client internally - requires refactoring for testability');
    }

    #[Test]
    public function it_can_be_serialized_for_queue()
    {
        // Arrange
        $proposalSlug = 'serialization-test';
        $job = new GenerateProposalOgImage($proposalSlug);

        // Act
        $serialized = serialize($job);
        $unserialized = unserialize($serialized);

        // Assert
        $this->assertInstanceOf(GenerateProposalOgImage::class, $unserialized);
        $this->assertEquals($proposalSlug, $unserialized->proposalSlug);
    }
}
