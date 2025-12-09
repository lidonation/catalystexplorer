<?php

declare(strict_types=1);

namespace Tests\Unit\Actions;

use Tests\TestCase;
use App\Actions\DecodeCatalystDocument;
use Illuminate\Support\Facades\Process;
use Illuminate\Process\PendingProcess;
use Illuminate\Support\Facades\Log;
use PHPUnit\Framework\Attributes\Test;
use Mockery;
use Exception;
use Symfony\Component\Process\Exception\ProcessSignaledException;

class DecodeCatalystDocumentTest extends TestCase
{
    private DecodeCatalystDocument $action;

    protected function setUp(): void
    {
        parent::setUp();
        $this->action = new DecodeCatalystDocument();
        Log::spy(); // Spy on log calls for testing
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    #[Test]
    public function it_handles_empty_binary_data_correctly()
    {
        $this->expectException(Exception::class);
        $this->expectExceptionMessage('Empty binary data provided');

        ($this->action)('');
    }

    #[Test]
    public function it_handles_null_binary_data_correctly()
    {
        $this->expectException(Exception::class);
        $this->expectExceptionMessage('Empty binary data provided');

        ($this->action)(null);
    }

    #[Test]
    public function it_handles_oversized_binary_data_correctly()
    {
        // Create binary data larger than 10MB limit
        $oversizedData = str_repeat('x', 10 * 1024 * 1024 + 1);

        $this->expectException(Exception::class);
        $this->expectExceptionMessage('Binary data too large: 10485761 bytes');

        ($this->action)($oversizedData);
    }

    #[Test]
    public function it_retries_decoding_multiple_times_on_failure()
    {
        $binaryData = 'test binary data';

        // Mock unsuccessful process result
        $mockResult = Mockery::mock();
        $mockResult->shouldReceive('successful')->andReturn(false);
        $mockResult->shouldReceive('output')->andReturn('{"error": "decode failed"}');
        $mockResult->shouldReceive('errorOutput')->andReturn('Process failed');

        // Mock PendingProcess to return our mock result
        $mockPendingProcess = Mockery::mock(PendingProcess::class);
        $mockPendingProcess->shouldReceive('timeout')->with(30)->andReturnSelf();
        $mockPendingProcess->shouldReceive('run')->with(['/venv/bin/python3', '/scripts/decodeProposalDirect.py'])->andReturn($mockResult);
        $mockPendingProcess->shouldReceive('run')->with(['/venv/bin/python3', '/scripts/decodeProposal.py'])->andReturn($mockResult);

        Process::shouldReceive('input')->with($binaryData)->andReturn($mockPendingProcess)->times(4); // 2 attempts × 2 methods each

        $this->expectException(Exception::class);
        $this->expectExceptionMessage('Process failed');

        ($this->action)($binaryData);

        // Verify that it logs the retry attempts
        Log::shouldHaveReceived('info')->with('Direct decode failed (attempt 1), trying COSE decoder');
        Log::shouldHaveReceived('info')->with('COSE decode failed (attempt 1), skipping recursive decoder to avoid hanging');
        Log::shouldHaveReceived('info')->with('Direct decode failed (attempt 2), trying COSE decoder');
        Log::shouldHaveReceived('info')->with('COSE decode failed (attempt 2), skipping recursive decoder to avoid hanging');
    }

    #[Test]
    public function it_successfully_decodes_valid_direct_cbor_data()
    {
        $binaryData = 'valid cbor binary data';
        $expectedDecoded = [
            'protected_headers' => ['1' => 'HS256'],
            'payload' => ['title' => 'Test Proposal', 'amount' => 50000],
            'signatures' => []
        ];

        // Mock successful process result for direct CBOR
        $mockResult = Mockery::mock();
        $mockResult->shouldReceive('successful')->andReturn(true);
        $mockResult->shouldReceive('output')->andReturn(json_encode($expectedDecoded));

        // Mock PendingProcess
        $mockPendingProcess = Mockery::mock(PendingProcess::class);
        $mockPendingProcess->shouldReceive('timeout')->with(30)->andReturnSelf();
        $mockPendingProcess->shouldReceive('run')->with(['/venv/bin/python3', '/scripts/decodeProposalDirect.py'])->andReturn($mockResult);

        Process::shouldReceive('input')->with($binaryData)->andReturn($mockPendingProcess)->once();

        $result = ($this->action)($binaryData);

        expect($result)->toBe($expectedDecoded);

        // Verify it logs success
        Log::shouldHaveReceived('debug')->with('Document decoded successfully on attempt 1');
    }

    #[Test]
    public function it_falls_back_to_cose_decoder_when_direct_fails()
    {
        $binaryData = 'cose binary data';
        $expectedDecoded = [
            'protected_headers' => ['1' => 'ES256'],
            'payload' => ['title' => 'COSE Proposal', 'amount' => 75000],
            'signatures' => [['kid' => 'key1', 'signature' => 'abc123']]
        ];

        // Mock failed direct decoder result
        $mockDirectResult = Mockery::mock();
        $mockDirectResult->shouldReceive('successful')->andReturn(false);
        $mockDirectResult->shouldReceive('output')->andReturn('{"error": "direct decode failed"}');

        // Mock successful COSE decoder result
        $mockCoseResult = Mockery::mock();
        $mockCoseResult->shouldReceive('successful')->andReturn(true);
        $mockCoseResult->shouldReceive('output')->andReturn(json_encode($expectedDecoded));

        // Mock PendingProcess
        $mockPendingProcess = Mockery::mock(PendingProcess::class);
        $mockPendingProcess->shouldReceive('timeout')->with(30)->andReturnSelf();
        $mockPendingProcess->shouldReceive('run')->with(['/venv/bin/python3', '/scripts/decodeProposalDirect.py'])->andReturn($mockDirectResult);
        $mockPendingProcess->shouldReceive('run')->with(['/venv/bin/python3', '/scripts/decodeProposal.py'])->andReturn($mockCoseResult);

        Process::shouldReceive('input')->with($binaryData)->andReturn($mockPendingProcess)->twice();

        $result = ($this->action)($binaryData);

        expect($result)->toBe($expectedDecoded);

        // Verify it logs the fallback
        Log::shouldHaveReceived('info')->with('Direct decode failed (attempt 1), trying COSE decoder');
        Log::shouldHaveReceived('debug')->with('Document decoded successfully on attempt 1');
    }

    #[Test]
    public function it_handles_json_decode_errors_and_retries()
    {
        $binaryData = 'test binary data';

        // First attempt returns invalid JSON, second attempt succeeds
        $mockResult1 = Mockery::mock();
        $mockResult1->shouldReceive('successful')->andReturn(true);
        $mockResult1->shouldReceive('output')->andReturn('invalid json {');

        $validJson = json_encode(['payload' => 'success']);
        $mockResult2 = Mockery::mock();
        $mockResult2->shouldReceive('successful')->andReturn(true);
        $mockResult2->shouldReceive('output')->andReturn($validJson);

        $mockPendingProcess = Mockery::mock(PendingProcess::class);
        $mockPendingProcess->shouldReceive('timeout')->with(30)->andReturnSelf();
        $mockPendingProcess->shouldReceive('run')->with(['/venv/bin/python3', '/scripts/decodeProposalDirect.py'])->andReturn($mockResult1, $mockResult2);

        Process::shouldReceive('input')->with($binaryData)->andReturn($mockPendingProcess)->twice();

        $result = ($this->action)($binaryData);

        expect($result)->toBe(['payload' => 'success']);

        // Verify JSON error logging
        Log::shouldHaveReceived('error')->withArgs(function ($message) {
            return str_contains($message, 'JSON decode error on attempt 1');
        });
    }

    #[Test]
    public function it_handles_process_signal_exceptions_and_retries()
    {
        $binaryData = 'test binary data that causes crash';

        // Create a mock process that will be returned by the exception
        $mockProcess = Mockery::mock(\Symfony\Component\Process\Process::class);
        $mockProcess->shouldReceive('getTermSignal')->andReturn(9); // SIGKILL

        // First attempt throws ProcessSignaledException, second succeeds
        $processException = new ProcessSignaledException($mockProcess);

        $validJson = json_encode(['payload' => 'recovered after crash']);
        $mockSuccessResult = Mockery::mock();
        $mockSuccessResult->shouldReceive('successful')->andReturn(true);
        $mockSuccessResult->shouldReceive('output')->andReturn($validJson);

        // Create separate mock pending processes for each call
        $mockPendingProcess1 = Mockery::mock(PendingProcess::class);
        $mockPendingProcess1->shouldReceive('timeout')->with(30)->andReturnSelf();
        $mockPendingProcess1->shouldReceive('run')
            ->with(['/venv/bin/python3', '/scripts/decodeProposalDirect.py'])
            ->andThrow($processException); // First call throws exception

        $mockPendingProcess2 = Mockery::mock(PendingProcess::class);
        $mockPendingProcess2->shouldReceive('timeout')->with(30)->andReturnSelf();
        $mockPendingProcess2->shouldReceive('run')
            ->with(['/venv/bin/python3', '/scripts/decodeProposalDirect.py'])
            ->andReturn($mockSuccessResult); // Second call succeeds

        Process::shouldReceive('input')->with($binaryData)
            ->andReturn($mockPendingProcess1, $mockPendingProcess2);

        $result = ($this->action)($binaryData);

        expect($result)->toBe(['payload' => 'recovered after crash']);

        // Verify crash logging
        Log::shouldHaveReceived('error')->withArgs(function ($message, $context = []) {
            return str_contains($message, 'Process crashed with signal 9 on attempt 1') &&
                   isset($context['signal']) && $context['signal'] === 9 &&
                   isset($context['attempt']) && $context['attempt'] === 1;
        });
    }

    #[Test]
    public function it_throws_exception_after_max_retries_with_signal_crashes()
    {
        $binaryData = 'consistently crashing data';

        $mockProcess = Mockery::mock(\Symfony\Component\Process\Process::class);
        $mockProcess->shouldReceive('getTermSignal')->andReturn(11); // SIGSEGV

        $processException = new ProcessSignaledException($mockProcess);

        $mockPendingProcess = Mockery::mock(PendingProcess::class);
        $mockPendingProcess->shouldReceive('timeout')->with(30)->andReturnSelf();
        $mockPendingProcess->shouldReceive('run')
            ->with(['/venv/bin/python3', '/scripts/decodeProposalDirect.py'])
            ->andThrow($processException);

        Process::shouldReceive('input')->with($binaryData)->andReturn($mockPendingProcess)->times(2);

        $this->expectException(Exception::class);
        $this->expectExceptionMessage('Decoder process crashed with signal 11 after 2 attempts. This may indicate corrupted or malformed CBOR data.');

        ($this->action)($binaryData);
    }

    #[Test]
    public function it_logs_binary_data_characteristics_for_debugging()
    {
        $binaryData = "test\x00\x01\x02\x03binary data with special chars\xff\xfe";

        $mockResult = Mockery::mock();
        $mockResult->shouldReceive('successful')->andReturn(true);
        $mockResult->shouldReceive('output')->andReturn('{"payload": "test"}');

        $mockPendingProcess = Mockery::mock(PendingProcess::class);
        $mockPendingProcess->shouldReceive('timeout')->with(30)->andReturnSelf();
        $mockPendingProcess->shouldReceive('run')->andReturn($mockResult);

        Process::shouldReceive('input')->with($binaryData)->andReturn($mockPendingProcess);

        $result = ($this->action)($binaryData);

        // Verify we got the expected result
        expect($result)->toBe(['payload' => 'test']);

        // Verify binary data logging
        Log::shouldHaveReceived('debug')->withArgs(function ($message, $context = []) use ($binaryData) {
            return $message === 'Processing binary data' &&
                   isset($context['size']) && $context['size'] === strlen($binaryData) &&
                   isset($context['first_bytes']) &&
                   isset($context['last_bytes']);
        });
    }

    #[Test]
    public function it_handles_successful_cose_output_with_error_field()
    {
        $binaryData = 'test binary data';

        // Mock direct decoder result that has "error" in output (treated as failed)
        $mockDirectResult = Mockery::mock();
        $mockDirectResult->shouldReceive('successful')->andReturn(true);
        $mockDirectResult->shouldReceive('output')->andReturn('{"error": "direct decode warning"}');

        // Mock COSE decoder result that succeeds with payload
        $mockCoseResult = Mockery::mock();
        $mockCoseResult->shouldReceive('successful')->andReturn(true);
        $mockCoseResult->shouldReceive('output')->andReturn('{"payload": "data", "signatures": []}');

        $mockPendingProcess = Mockery::mock(PendingProcess::class);
        $mockPendingProcess->shouldReceive('timeout')->with(30)->andReturnSelf();
        $mockPendingProcess->shouldReceive('run')->with(['/venv/bin/python3', '/scripts/decodeProposalDirect.py'])->andReturn($mockDirectResult);
        $mockPendingProcess->shouldReceive('run')->with(['/venv/bin/python3', '/scripts/decodeProposal.py'])->andReturn($mockCoseResult);

        Process::shouldReceive('input')->with($binaryData)->andReturn($mockPendingProcess)->twice();

        $result = ($this->action)($binaryData);

        expect($result)->toBe(['payload' => 'data', 'signatures' => []]);

        // Should have tried COSE decoder after direct failed due to "error" in output
        Log::shouldHaveReceived('info')->with('Direct decode failed (attempt 1), trying COSE decoder');
    }
}
