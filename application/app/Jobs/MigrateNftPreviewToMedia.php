<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\Nft;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class MigrateNftPreviewToMedia implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of seconds the job can run before timing out.
     *
     * @var int
     */
    public $timeout = 3600; // 1 hour timeout

    /**
     * The number of times the job may be attempted.
     *
     * @var int
     */
    public $tries = 3;

    /**
     * Create a new job instance.
     */
    public function __construct(
        private ?int $batchSize = 100,
        private ?bool $forceRegenerate = false,
        private ?int $startId = null,
        private ?int $endId = null
    ) {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $query = Nft::whereNotNull('preview_link')
            ->whereRaw("preview_link != ''");

        if ($this->startId) {
            $query->where('id', '>=', $this->startId);
        }
        if ($this->endId) {
            $query->where('id', '<=', $this->endId);
        }

        if (! $this->forceRegenerate) {
            $query->whereDoesntHave('media', function ($q) {
                $q->where('collection_name', 'preview');
            });
        }

        $totalNfts = $query->count();
        $processedCount = 0;
        $successCount = 0;
        $errorCount = 0;

        $query->chunkById($this->batchSize, function ($nfts) use (&$processedCount, &$successCount, &$errorCount, $totalNfts) {
            foreach ($nfts as $nft) {
                $processedCount++;

                try {
                    if (! $this->forceRegenerate && $nft->hasMedia('preview')) {
                        continue;
                    }

                    if ($this->forceRegenerate && $nft->hasMedia('preview')) {
                        $nft->clearMediaCollection('preview');
                    }

                    if (empty($nft->preview_link)) {
                        Log::warning("NFT #{$nft->id} has empty preview_link");

                        continue;
                    }

                    if (filter_var($nft->preview_link, FILTER_VALIDATE_URL)) {
                        $nft->addMediaFromUrl($nft->preview_link)
                            ->withResponsiveImages()
                            ->toMediaCollection('preview');

                        $successCount++;
                    } else {
                        Log::warning("NFT #{$nft->id} has invalid URL format", [
                            'preview_link' => $nft->preview_link,
                        ]);
                    }
                } catch (\Exception $e) {
                    $errorCount++;

                    Log::error("Error migrating preview_link for NFT #{$nft->id}", [
                        'preview_link' => $nft->preview_link,
                        'error' => $e->getMessage(),
                        'trace' => $e->getTraceAsString(),
                    ]);
                }

                if ($processedCount % 10 === 0 || $processedCount === $totalNfts) {
                    $percentage = round(($processedCount / $totalNfts) * 100, 2);
                }
            }
        });
    }
}
