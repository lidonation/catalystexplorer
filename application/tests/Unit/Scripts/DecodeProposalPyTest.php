<?php

declare(strict_types=1);

namespace Tests\Unit\Scripts;

use Tests\TestCase;
use Illuminate\Support\Facades\Process;
use PHPUnit\Framework\Attributes\Test;
use Illuminate\Foundation\Testing\WithoutMiddleware;

/**
 * Tests for Python decodeProposal.py script behavior
 * These tests mock the Process facade to simulate script outputs
 */
class DecodeProposalPyTest extends TestCase
{
    use WithoutMiddleware;

    private string $pythonPath = '/venv/bin/python3';
    private string $scriptPath = '/opt/catalyst-proposal-decoder/decodeProposal.py';

    #[Test]
    public function it_correctly_decodes_cose_messages_with_payload()
    {
        // Mock expected COSE decoder output
        $mockCoseOutput = json_encode([
            'protected_headers' => [
                '1' => -7, // ES256 algorithm
                '4' => 'catalyst-signing-key'
            ],
            'payload' => [
                'proposal_id' => '12345',
                'title' => 'Test Catalyst Proposal',
                'summary' => 'This is a test proposal for unit testing',
                'public_key' => '1a2b3c4d5e6f',
                'funds' => 50000,
                'url' => 'https://example.com/proposal'
            ],
            'signatures' => [
                [
                    'kid' => 'signing-key-1',
                    'protected' => ['1' => -7],
                    'signature' => 'abcd1234567890ef'
                ]
            ]
        ]);

        Process::fake([
            '*decodeProposal.py*' => Process::result($mockCoseOutput)
        ]);

        $testBinaryData = 'mock_cose_binary_data';

        $result = Process::input($testBinaryData)
            ->run([$this->pythonPath, $this->scriptPath]);

        expect($result->successful())->toBeTrue();
        
        $decodedData = json_decode($result->output(), true);
        
        expect($decodedData['protected_headers'])->toBeArray();
        expect($decodedData['payload'])->toBeArray();
        expect($decodedData['payload']['proposal_id'])->toBe('12345');
        expect($decodedData['payload']['title'])->toBe('Test Catalyst Proposal');
        expect($decodedData['payload']['funds'])->toBe(50000);
        expect($decodedData['signatures'])->toBeArray();
        expect($decodedData['signatures'][0]['kid'])->toBe('signing-key-1');
    }

    #[Test]
    public function it_handles_cose_messages_with_compressed_json_payload()
    {
        $mockCompressedOutput = json_encode([
            'protected_headers' => ['1' => -7],
            'payload' => [
                'compressed' => true,
                'proposal_data' => [
                    'id' => 'compressed-proposal-001',
                    'title' => 'Compressed Proposal Title',
                    'category' => 'dApps & Integrations',
                    'requested_funds' => 75000
                ]
            ],
            'signatures' => []
        ]);

        Process::fake([
            '*decodeProposal.py*' => Process::result($mockCompressedOutput)
        ]);

        $testBinaryData = 'mock_compressed_cose_data';

        $result = Process::input($testBinaryData)
            ->run([$this->pythonPath, $this->scriptPath]);

        expect($result->successful())->toBeTrue();
        
        $decodedData = json_decode($result->output(), true);
        
        expect($decodedData['payload']['compressed'])->toBeTrue();
        expect($decodedData['payload']['proposal_data']['id'])->toBe('compressed-proposal-001');
        expect($decodedData['payload']['proposal_data']['requested_funds'])->toBe(75000);
    }

    #[Test]
    public function it_handles_cose_decode_failures_gracefully()
    {
        $errorOutput = json_encode([
            'error' => 'Failed to decode COSE: Invalid COSE message format'
        ]);

        Process::fake([
            '*decodeProposal.py*' => Process::result(
                output: $errorOutput,
                exitCode: 1
            )
        ]);

        $invalidBinaryData = 'invalid_cose_data';

        $result = Process::input($invalidBinaryData)
            ->run([$this->pythonPath, $this->scriptPath]);

        // When exit code is 1, the process should be considered failed
        expect($result->exitCode())->toBe(1);
        expect($result->failed())->toBeTrue();
        
        $errorData = json_decode($result->output(), true);
        expect($errorData['error'])->toContain('Failed to decode COSE');
    }

    #[Test]
    public function it_handles_payload_decompression_errors()
    {
        $mockDecompressionErrorOutput = json_encode([
            'protected_headers' => ['1' => -7],
            'payload' => 'raw_hex_data_due_to_decompression_failure',
            'payload_error' => 'Failed to decompress or decode payload: brotli decompression failed',
            'signatures' => []
        ]);

        Process::fake([
            '*decodeProposal.py*' => Process::result($mockDecompressionErrorOutput)
        ]);

        $testBinaryData = 'cose_with_bad_compression';

        $result = Process::input($testBinaryData)
            ->run([$this->pythonPath, $this->scriptPath]);

        expect($result->successful())->toBeTrue();
        
        $decodedData = json_decode($result->output(), true);
        
        expect($decodedData['payload'])->toBe('raw_hex_data_due_to_decompression_failure');
        expect($decodedData['payload_error'])->toContain('Failed to decompress or decode payload');
    }

    #[Test]
    public function it_handles_multiple_signatures_correctly()
    {
        $mockMultiSigOutput = json_encode([
            'protected_headers' => ['1' => -7],
            'payload' => [
                'proposal_id' => 'multi-sig-proposal',
                'title' => 'Multi-Signature Proposal'
            ],
            'signatures' => [
                [
                    'kid' => 'signer-1',
                    'protected' => ['1' => -7],
                    'signature' => 'signature_1_hex'
                ],
                [
                    'kid' => 'signer-2',
                    'protected' => ['1' => -7],
                    'signature' => 'signature_2_hex'
                ],
                [
                    'kid' => 'signer-3',
                    'protected' => ['1' => -8], // Different algorithm
                    'signature' => 'signature_3_hex'
                ]
            ]
        ]);

        Process::fake([
            '*decodeProposal.py*' => Process::result($mockMultiSigOutput)
        ]);

        $testBinaryData = 'multi_signature_cose_data';

        $result = Process::input($testBinaryData)
            ->run([$this->pythonPath, $this->scriptPath]);

        expect($result->successful())->toBeTrue();
        
        $decodedData = json_decode($result->output(), true);
        
        expect($decodedData['signatures'])->toHaveCount(3);
        expect($decodedData['signatures'][0]['kid'])->toBe('signer-1');
        expect($decodedData['signatures'][1]['kid'])->toBe('signer-2');
        expect($decodedData['signatures'][2]['kid'])->toBe('signer-3');
        expect($decodedData['signatures'][2]['protected']['1'])->toBe(-8);
    }

    #[Test]
    public function it_handles_nested_json_payload_correctly()
    {
        $mockNestedJsonOutput = json_encode([
            'protected_headers' => ['1' => -7],
            'payload' => [
                'metadata' => [
                    'version' => '1.0',
                    'created_at' => '2024-01-15T10:30:00Z'
                ],
                'proposal' => [
                    'basic_info' => [
                        'title' => 'Advanced DeFi Protocol',
                        'category' => 'DeFi',
                        'funds_requested' => 150000
                    ],
                    'team' => [
                        [
                            'name' => 'Alice Johnson',
                            'role' => 'Lead Developer',
                            'experience' => '5 years blockchain'
                        ],
                        [
                            'name' => 'Bob Smith',
                            'role' => 'Product Manager',
                            'experience' => '3 years crypto'
                        ]
                    ],
                    'milestones' => [
                        [
                            'title' => 'MVP Development',
                            'duration' => 3,
                            'budget' => 50000
                        ],
                        [
                            'title' => 'Security Audit',
                            'duration' => 1,
                            'budget' => 25000
                        ]
                    ]
                ]
            ],
            'signatures' => [
                [
                    'kid' => 'team-lead-key',
                    'protected' => ['1' => -7],
                    'signature' => 'team_signature_hex'
                ]
            ]
        ]);

        Process::fake([
            '*decodeProposal.py*' => Process::result($mockNestedJsonOutput)
        ]);

        $testBinaryData = 'nested_json_cose_data';

        $result = Process::input($testBinaryData)
            ->run([$this->pythonPath, $this->scriptPath]);

        expect($result->successful())->toBeTrue();
        
        $decodedData = json_decode($result->output(), true);
        
        expect($decodedData['payload']['metadata']['version'])->toBe('1.0');
        expect($decodedData['payload']['proposal']['basic_info']['title'])->toBe('Advanced DeFi Protocol');
        expect($decodedData['payload']['proposal']['team'])->toHaveCount(2);
        expect($decodedData['payload']['proposal']['team'][0]['name'])->toBe('Alice Johnson');
        expect($decodedData['payload']['proposal']['milestones'])->toHaveCount(2);
        expect($decodedData['payload']['proposal']['milestones'][0]['budget'])->toBe(50000);
    }

    #[Test]
    public function it_handles_binary_payload_data()
    {
        $mockBinaryPayloadOutput = json_encode([
            'protected_headers' => ['1' => -7],
            'payload' => '48656c6c6f20576f726c64', // "Hello World" in hex
            'payload_error' => 'Failed to parse payload JSON: Expecting value: line 1 column 1 (char 0)',
            'signatures' => []
        ]);

        Process::fake([
            '*decodeProposal.py*' => Process::result($mockBinaryPayloadOutput)
        ]);

        $testBinaryData = 'binary_payload_cose_data';

        $result = Process::input($testBinaryData)
            ->run([$this->pythonPath, $this->scriptPath]);

        expect($result->successful())->toBeTrue();
        
        $decodedData = json_decode($result->output(), true);
        
        expect($decodedData['payload'])->toBe('48656c6c6f20576f726c64');
        expect($decodedData['payload_error'])->toContain('Failed to parse payload JSON');
    }

    #[Test]
    public function it_handles_empty_signatures_array()
    {
        $mockNoSignaturesOutput = json_encode([
            'protected_headers' => ['1' => -7],
            'payload' => [
                'proposal_id' => 'unsigned-proposal',
                'title' => 'Unsigned Test Proposal',
                'status' => 'draft'
            ],
            'signatures' => []
        ]);

        Process::fake([
            '*decodeProposal.py*' => Process::result($mockNoSignaturesOutput)
        ]);

        $testBinaryData = 'unsigned_cose_data';

        $result = Process::input($testBinaryData)
            ->run([$this->pythonPath, $this->scriptPath]);

        expect($result->successful())->toBeTrue();
        
        $decodedData = json_decode($result->output(), true);
        
        expect($decodedData['payload']['proposal_id'])->toBe('unsigned-proposal');
        expect($decodedData['signatures'])->toBeArray();
        expect($decodedData['signatures'])->toBeEmpty();
    }

    #[Test]
    public function it_processes_file_input_correctly()
    {
        $mockFileOutput = json_encode([
            'protected_headers' => ['1' => -7],
            'payload' => [
                'source' => 'file_input',
                'proposal_id' => 'file-based-proposal'
            ],
            'signatures' => []
        ]);

        // Mock file-based execution (when script receives file path as argument)
        Process::fake([
            '*decodeProposal.py*' => Process::result($mockFileOutput)
        ]);

        $result = Process::run([
            $this->pythonPath, 
            $this->scriptPath, 
            '/tmp/test_cose_file.bin'
        ]);

        expect($result->successful())->toBeTrue();
        
        $decodedData = json_decode($result->output(), true);
        
        expect($decodedData['payload']['source'])->toBe('file_input');
        expect($decodedData['payload']['proposal_id'])->toBe('file-based-proposal');
    }
}