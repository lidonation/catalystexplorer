<?php

declare(strict_types=1);

namespace App\Invokables;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Process;

final class DecodeCardanoSignature
{
    public function __invoke(string $signature)
    {
        // Detect environment and set appropriate paths
        $python = $this->getPythonPath();
        $script = $this->getScriptPath();

        Log::info('DecodeCardanoSignature: Using paths', [
            'python' => $python,
            'script' => $script,
            'python_exists' => file_exists($python),
            'script_exists' => file_exists($script),
        ]);

        $result = Process::pipe(function ($process) use ($python, $script, $signature) {
            $process->command([$python, $script])
                ->input($signature)
                ->run();
        });

        if (! $result->successful()) {
            Log::error('DecodeCardanoSignature: Process failed', [
                'exit_code' => $result->exitCode(),
                'stdout' => $result->output(),
                'stderr' => $result->errorOutput(),
                'signature_length' => strlen($signature),
                'signature_preview' => substr($signature, 0, 50).'...',
            ]);

            $errorMsg = $result->errorOutput() ?: $result->output();
            if (empty($errorMsg)) {
                $errorMsg = 'Python script execution failed with exit code: '.$result->exitCode();
            }

            throw new \Exception('Cardano signature decoding failed: '.$errorMsg);
        }

        $output = $result->output();
        $decoded = json_decode($output, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            Log::error('DecodeCardanoSignature: JSON decode failed', [
                'json_error' => json_last_error_msg(),
                'json_error_code' => json_last_error(),
                'raw_output' => $output,
                'output_length' => strlen($output),
            ]);

            throw new \Exception('Failed to parse signature decoding response: '.json_last_error_msg().'. Raw output: '.$output);
        }

        // Check if the decoded response contains an error
        if (isset($decoded['error'])) {
            Log::error('DecodeCardanoSignature: Python script returned error', [
                'error' => $decoded['error'],
                'signature_preview' => substr($signature, 0, 50).'...',
            ]);

            throw new \Exception('Signature decoding error: '.$decoded['error']);
        }

        Log::info('DecodeCardanoSignature: Successfully decoded signature', [
            'has_bech32_address' => isset($decoded['bech32_address']),
            'has_stake_address' => isset($decoded['stake_address']),
            'network' => $decoded['network'] ?? 'unknown',
        ]);

        return $decoded;
    }

    private function getPythonPath(): string
    {
        // Check if we're running in Docker container (has the venv path)
        if (file_exists('/venv/bin/python3')) {
            return '/venv/bin/python3';
        }

        // Check for local virtual environment
        $localVenv = base_path('venv/bin/python3');
        if (file_exists($localVenv)) {
            return $localVenv;
        }

        // Check for system python3 with required packages
        $systemPython = '/usr/bin/python3';
        if (file_exists($systemPython)) {
            return $systemPython;
        }

        // Fall back to 'python3' in PATH
        return 'python3';
    }

    private function getScriptPath(): string
    {
        // Check if we're running in Docker container
        if (file_exists('/scripts/DecodeWalletSignature.py')) {
            return '/scripts/DecodeWalletSignature.py';
        }

        // Check for local script in docker/scripts
        $localScript = base_path('docker/scripts/DecodeWalletSignature.py');
        if (file_exists($localScript)) {
            return $localScript;
        }

        throw new \Exception('DecodeWalletSignature.py script not found');
    }
}
