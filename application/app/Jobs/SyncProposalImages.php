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
use Illuminate\Support\Str;

class SyncProposalImages implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        private Proposal $proposal
    ) {}

    public function handle()
    {
        if (!$this->proposal->ideascale_link) {
            return;
        }

        try {
            $imageUrl = $this->extractImageFromIdeascaleLink($this->proposal->ideascale_link);
            
            if ($imageUrl) {
                $this->downloadAndAttachImage($imageUrl);
            }
        } catch (\Exception $e) {
            Log::error('Proposal image sync failed', [
                'proposal_id' => $this->proposal->id,
                'ideascale_link' => $this->proposal->ideascale_link,
                'error' => $e->getMessage()
            ]);
        }
    }

    public function extractImageFromIdeascaleLink(string $link): ?string
    {
        try {
            // Fetch the HTML content
            $response = Http::timeout(10)->get($link);
            
            if (!$response->successful()) {
                Log::warning('Failed to fetch Ideascale link', [
                    'link' => $link,
                    'status' => $response->status()
                ]);
                return null;
            }

            $html = $response->body();

            // More robust image extraction
            if (preg_match('/<img[^>]+src="([^"]+)"[^>]*class="[^"]*proposal-image[^"]*"[^>]*>/i', $html, $matches)) {
                $imageUrl = $matches[1];
            } elseif (preg_match('/<img[^>]+src="([^"]+)"[^>]*>/i', $html, $matches)) {
                $imageUrl = $matches[1];
            } else {
                Log::warning('No image found in Ideascale link', ['link' => $link]);
                return null;
            }

            // Ensure it's a full URL
            if (!Str::startsWith($imageUrl, ['http://', 'https://'])) {
                $parsedLink = parse_url($link);
                $baseUrl = $parsedLink['scheme'] . '://' . $parsedLink['host'];
                $imageUrl = rtrim($baseUrl, '/') . '/' . ltrim($imageUrl, '/');
            }

            return $imageUrl;
        } catch (\Exception $e) {
            Log::warning('Error extracting image from Ideascale link', [
                'link' => $link,
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }

    public function downloadAndAttachImage(string $imageUrl): void
    {
        try {
            // Generate a unique filename
            $filename = Str::slug(Str::random(10)) . '_' . basename($imageUrl);

            // Download and attach the image
            $this->proposal
                ->addMediaFromUrl($imageUrl)
                ->setFileName($filename)
                ->withCustomProperties([
                    'original_url' => $imageUrl,
                    'source' => 'ideascale'
                ])
                ->toMediaCollection('hero_image');

            Log::info('Image downloaded successfully', [
                'proposal_id' => $this->proposal->id,
                'image_url' => $imageUrl
            ]);
        } catch (\Exception $e) {
            Log::warning('Failed to download Ideascale image', [
                'url' => $imageUrl,
                'proposal_id' => $this->proposal->id,
                'error' => $e->getMessage()
            ]);
        }
    }
}
