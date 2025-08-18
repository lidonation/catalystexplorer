<?php

namespace App\Invokables;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Process;

class DecodeCatalystDocument
{
    public function __invoke($binary)
    {
        $python = '/venv/bin/python3';
        $script = '/scripts/decodeCatalystProposal.py';

        $result = Process::pipe(function ($process) use ($python, $script, $binary) {
            $process->command([$python, $script])
                ->input($binary)
                ->run();
        });

        if (! $result->successful()) {
            Log::error(' Decode failed ');
            Log::error('STDOUT: '.$result->output());
            Log::error('STDERR: '.$result->errorOutput());
            throw new \Exception($result->errorOutput());
        }

        $decoded = json_decode($result->output(), true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            Log::error(' JSON decode : '.json_last_error_msg());
            Log::error('Raw output: '.$result->output());
            throw new \Exception($result->output());
        }

        return $decoded;
    }
}
