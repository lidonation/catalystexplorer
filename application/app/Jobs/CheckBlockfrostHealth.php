<?php

declare(strict_types=1);

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class CheckBlockfrostHealth implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle()
    {
        $baseUrls = [
            config('services.blockfrost.base_url'),
            config('services.blockfrost.baseUrlFallback'),
        ];

        foreach ($baseUrls as $url) {
            if ($this->isHealthy($url)) {
                Cache::put('blockfrost_base_url', $url, now()->addMinutes(35));
                Log::info("Blockfrost Health Check: Using healthy URL → {$url}");

                return $url;
            }
        }

        Log::warning('Blockfrost Health Check: No healthy endpoints found.');
    }

    protected function isHealthy(string $baseUrl): bool
    {
        try {
            $response = Http::timeout(10)
                ->withHeaders([
                    'project_id' => config('services.blockfrost.project_id'),
                    'Accept' => 'application/json',
                ])
                ->get("{$baseUrl}/health");

            return $response->ok() && $response->json('is_healthy') === true;
        } catch (\Exception $e) {
            Log::error("Health check failed for $baseUrl: ".$e->getMessage());

            return false;
        }
    }
}
