<?php

namespace App\Jobs;

use App\Models\Proposal;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\File;

class SyncProposalImages implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 2;
    public $timeout = 60;

    public function handle()
    {
        // Robust directory creation with full path and permissions
        $storagePath = storage_path('app/public/proposals');
        
        try {
            // Use recursive directory creation with explicit permissions
            if (!is_dir($storagePath)) {
                mkdir($storagePath, 0777, true);
                chmod($storagePath, 0777);
            }
        } catch (\Exception $e) {
            Log::error("Failed to create directory: " . $e->getMessage());
            return; // Exit the job if directory can't be created
        }

        $proposals = Proposal::whereNotNull('ideascale_link')->get();

        foreach ($proposals as $proposal) {
            $imageUrl = $proposal->ideascale_link;

            // Validate URL more strictly
            if (!$this->isValidUrl($imageUrl)) {
                Log::warning("Invalid or unparseable URL for proposal: {$proposal->id} - {$imageUrl}");
                continue;
            }

            try {
                $response = Http::withOptions([
                    'connect_timeout' => 10,   // Connection timeout
                    'timeout' => 30,           // Total transfer timeout
                    'verify' => false,         // Disable SSL verification
                ])
                ->withHeaders([
                    'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Accept' => 'image/*,*/*;q=0.8',
                ])
                ->get($imageUrl);

                // Explicitly check content type
                $contentType = strtolower($response->header('Content-Type', ''));
                
                // More lenient content type checking
                if (strpos($contentType, 'image/') === false) {
                    Log::warning("Non-image content for proposal {$proposal->id}: {$contentType}");
                    continue;
                }

                if ($response->successful()) {
                    $extension = $this->getImageExtension($contentType);
                    $filename = Str::uuid() . '.' . $extension;
                    $path = "proposals/{$filename}";

                    // Save the image
                    Storage::disk('public')->put($path, $response->body());

                    // Update proposal with new image path
                    $proposal->update([
                        'ideascale_link' => $path,
                    ]);

                    Log::info("Successfully downloaded image for proposal {$proposal->id}: {$path}");
                } else {
                    Log::warning("Failed to download image for proposal {$proposal->id}: HTTP {$response->status()}");
                }
            } catch (\Exception $e) {
                Log::error("Image download error for proposal {$proposal->id}: " . $e->getMessage());
            }
        }
    }

    /**
     * Validate URL more comprehensively
     */
    private function isValidUrl($url): bool
    {
        return filter_var($url, FILTER_VALIDATE_URL) !== false 
               && preg_match('/^https?:\/\//i', $url);
    }

    /**
     * Get file extension from content type
     */
    private function getImageExtension($contentType): string
    {
        $typeToExtension = [
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'image/gif' => 'gif',
            'image/webp' => 'webp',
            'image/svg+xml' => 'svg',
        ];

        // Default to jpg if content type not recognized
        foreach ($typeToExtension as $type => $ext) {
            if (strpos($contentType, $type) !== false) {
                return $ext;
            }
        }

        return 'jpg';
    }
}
