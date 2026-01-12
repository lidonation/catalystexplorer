<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\Proposal;
use GuzzleHttp\Client;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class GenerateProposalOgImage implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public string $proposalSlug
    ) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            $proposal = Proposal::where('slug', $this->proposalSlug)->first();

            if (! $proposal) {
                Log::warning('Proposal not found for OG image generation', [
                    'slug' => $this->proposalSlug,
                ]);

                return;
            }

            $locale = config('localized-routes.fallback_locale', config('app.locale'));

            $hostname = parse_url(config('app.url'), PHP_URL_HOST);
            $baseUrl = rtrim(config('app.url'), '/');
            $resolvedIp = gethostbyname(config('app.service', $hostname));
            $url = "{$baseUrl}/{$locale}/proposals/{$proposal->slug}/og-image";

            $client = new Client([
                'verify' => false,
                'timeout' => 60,
                'curl' => [
                    CURLOPT_SSL_VERIFYPEER => false,
                    CURLOPT_SSL_VERIFYHOST => 0,
                    CURLOPT_RESOLVE => ["{$hostname}:443:{$resolvedIp}"],
                ],
            ]);

            $response = $client->get($url);

            if ($response->getStatusCode() === 200) {
                Log::info('OG image generated successfully', [
                    'proposal_id' => $proposal->id,
                    'slug' => $proposal->slug,
                ]);
            } else {
                Log::error('Failed to generate OG image', [
                    'proposal_id' => $proposal->id,
                    'slug' => $proposal->slug,
                    'status' => $response->getStatusCode(),
                ]);
            }
        } catch (\Throwable $e) {
            Log::error('Error generating OG image', [
                'slug' => $this->proposalSlug,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }
}
