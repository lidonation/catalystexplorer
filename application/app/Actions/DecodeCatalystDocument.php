<?php

declare(strict_types=1);

namespace App\Actions;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Process;
use Symfony\Component\Process\Exception\ProcessSignaledException;

class DecodeCatalystDocument
{
    private const MAX_EXECUTION_TIME = 30; // 30 seconds timeout

    private const MAX_BINARY_SIZE = 10 * 1024 * 1024; // 10MB limit

    private const MAX_RETRIES = 2;

    public function __invoke($binary)
    {
        // Validate input data
        if (empty($binary)) {
            throw new \Exception('Empty binary data provided');
        }

        if (strlen($binary) > self::MAX_BINARY_SIZE) {
            throw new \Exception('Binary data too large: '.strlen($binary).' bytes');
        }

        // Log binary data characteristics for debugging
        $binaryInfo = [
            'size' => strlen($binary),
            'first_bytes' => bin2hex(substr($binary, 0, 32)),
            'last_bytes' => bin2hex(substr($binary, -32)),
        ];
        Log::debug('Processing binary data', $binaryInfo);

        // Use Docker container paths (venv has required packages)
        $python = '/venv/bin/python3';
        $coseScript = '/scripts/decodeProposal.py';
        $directScript = '/scripts/decodeProposalDirect.py';
        $recursiveScript = '/scripts/decodeProposalRecursive.py';

        $attempts = 0;
        $lastException = null;

        while ($attempts < self::MAX_RETRIES) {
            $attempts++;

            try {
                // Try direct CBOR decoder first (more stable)
                $result = $this->runDecoderWithTimeout($binary, $python, $directScript, 'Direct CBOR');

                // If direct fails, try COSE decoder
                if (! $result->successful() || str_contains($result->output(), '"error"')) {
                    Log::info("Direct decode failed (attempt {$attempts}), trying COSE decoder");

                    $result = $this->runDecoderWithTimeout($binary, $python, $coseScript, 'COSE');

                    if (! $result->successful() || str_contains($result->output(), '"error"')) {
                        Log::info("COSE decode failed (attempt {$attempts}), skipping recursive decoder to avoid hanging");

                        $errorMsg = "Decode failed (direct and COSE methods) on attempt {$attempts}";
                        Log::error($errorMsg);
                        Log::error('STDOUT: '.$result->output());
                        Log::error('STDERR: '.$result->errorOutput());

                        if ($attempts >= self::MAX_RETRIES) {
                            throw new \Exception($result->errorOutput() ?: 'Unknown decoder error');
                        }

                        continue; // Retry
                    }
                }

                // Parse JSON output
                $decoded = json_decode($result->output(), true);

                if (json_last_error() !== JSON_ERROR_NONE) {
                    $jsonError = json_last_error_msg();
                    Log::error("JSON decode error on attempt {$attempts}: {$jsonError}");
                    Log::error('Raw output: '.substr($result->output(), 0, 1000)); // Limit log size

                    if ($attempts >= self::MAX_RETRIES) {
                        throw new \Exception("JSON decode error: {$jsonError}");
                    }

                    continue; // Retry
                }

                // Success!
                Log::debug("Document decoded successfully on attempt {$attempts}");

                return $decoded;

            } catch (ProcessSignaledException $e) {
                $lastException = $e;
                $signal = $e->getProcess()->getTermSignal();
                Log::error("Process crashed with signal {$signal} on attempt {$attempts}", [
                    'binary_info' => $binaryInfo,
                    'signal' => $signal,
                    'attempt' => $attempts,
                ]);

                if ($attempts >= self::MAX_RETRIES) {
                    throw new \Exception("Decoder process crashed with signal {$signal} after {$attempts} attempts. This may indicate corrupted or malformed CBOR data.");
                }

                // Brief delay before retry
                usleep(500000); // 0.5 seconds
            } catch (\Exception $e) {
                $lastException = $e;
                Log::error("Decoder error on attempt {$attempts}: ".$e->getMessage());

                if ($attempts >= self::MAX_RETRIES) {
                    throw $e;
                }
            }
        }

        throw $lastException ?: new \Exception('Failed to decode document after maximum retries');
    }

    private function runDecoderWithTimeout($binary, $python, $script, $decoderType)
    {
        Log::debug("Running {$decoderType} decoder");

        return Process::input($binary)
            ->timeout(self::MAX_EXECUTION_TIME)
            ->run([$python, $script]);
    }
}
