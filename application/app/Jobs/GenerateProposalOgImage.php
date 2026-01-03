<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\Proposal;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
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

            // Generate the OG image by making an internal HTTP request to the route
            $url = url("/og-image/proposals/{$proposal->slug}");

            $response = Http::timeout(60)->get($url);

            if ($response->successful()) {
                Log::info('OG image generated successfully', [
                    'proposal_id' => $proposal->id,
                    'slug' => $proposal->slug,
                ]);
            } else {
                Log::error('Failed to generate OG image', [
                    'proposal_id' => $proposal->id,
                    'slug' => $proposal->slug,
                    'status' => $response->status(),
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
