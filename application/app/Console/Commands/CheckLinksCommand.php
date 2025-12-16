<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Link;
use Illuminate\Console\Command;
use Illuminate\Http\Client\Pool;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class CheckLinksCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'cx:check-links
        {--batch-size=25 : Number of links to process in each batch}
        {--timeout=10 : HTTP request timeout in seconds}
        {--concurrency=10 : Number of concurrent requests}
        {--delay=0.5 : Delay between batches in seconds}
        {--force : Check all links regardless of last check date}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check all links for validity and update their status';

    private int $checkedCount = 0;

    private int $validCount = 0;

    private int $invalidCount = 0;

    private int $errorCount = 0;

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Starting link validation check...');

        $batchSize = (int) $this->option('batch-size');
        $timeout = (int) $this->option('timeout');
        $concurrency = (int) $this->option('concurrency');
        $delay = (float) $this->option('delay');
        $force = $this->option('force');

        $query = Link::query();

        if (! $force) {
            $query->where(function ($q) {
                $q->whereNull('updated_at')
                    ->orWhere('updated_at', '<', now()->subDays(29));
            });
        }

        $totalLinks = $query->count();

        if ($totalLinks === 0) {
            $this->info('No links need to be checked.');

            return Command::SUCCESS;
        }

        $this->info("Found {$totalLinks} links to check");

        $progressBar = $this->output->createProgressBar($totalLinks);
        $progressBar->start();

        $query->chunk($batchSize, function ($links) use ($timeout, $concurrency, $delay, $progressBar) {
            $this->checkLinksInParallel($links, $timeout, $concurrency);
            $progressBar->advance($links->count());

            if ($delay > 0) {
                usleep((int) ($delay * 1000000));
            }
        });

        $progressBar->finish();
        $this->newLine();

        $this->displaySummary();

        return Command::SUCCESS;
    }

    private function checkLinksInParallel($links, int $timeout, int $concurrency): void
    {
        try {
            $responses = Http::pool(function (Pool $pool) use ($links, $timeout) {
                $requests = [];
                foreach ($links as $link) {
                    $requests[$link->id] = $pool
                        ->timeout($timeout)
                        ->withUserAgent('Mozilla/5.0 (compatible; CatalystExplorer/2.0; +https://catalystexplorer.com)')
                        ->withOptions([
                            'allow_redirects' => [
                                'max' => 3,
                                'strict' => false,
                            ],
                            'verify' => false,
                            'connect_timeout' => 5,
                        ])
                        ->head($link->link);
                }

                return $requests;
            }, $concurrency);
        } catch (\Exception $e) {
            Log::error('HTTP Pool failed', [
                'error' => $e->getMessage(),
                'batch_size' => $links->count(),
            ]);

            // Fall back to individual requests
            foreach ($links as $link) {
                $this->checkSingleLink($link, $timeout);
            }

            return;
        }

        foreach ($links as $link) {
            $this->checkedCount++;

            if (! isset($responses[$link->id])) {
                $this->errorCount++;

                // Skip updating the link when no response is received
                Log::error('No response received for link - skipping update', [
                    'link_id' => $link->id,
                    'url' => $link->link,
                    'title' => $link->title,
                ]);

                continue;
            }

            $response = $responses[$link->id];

            try {
                // Consider successful responses and certain blocked status codes as valid
                // 403 (Forbidden): Server blocks access but link exists
                // 405 (Method Not Allowed): Server blocks HEAD requests but link works
                // 999 (LinkedIn): LinkedIn returns 999 for unauthenticated requests but profiles exist
                $statusCode = $response->status();
                $isValid = $response->successful() || in_array($statusCode, [403, 405, 999]);

                // Debug log for LinkedIn links
                if (str_contains($link->link, 'linkedin.com')) {
                    Log::info('LinkedIn link check', [
                        'url' => $link->link,
                        'status_code' => $statusCode,
                        'is_valid' => $isValid,
                        'successful' => $response->successful(),
                    ]);
                }

                $link->update([
                    'valid' => $isValid,
                    'updated_at' => now(),
                ]);

                if (! $isValid) {
                    $this->invalidCount++;

                    Log::warning('Invalid link found', [
                        'link_id' => $link->id,
                        'url' => $link->link,
                        'status_code' => $statusCode,
                        'title' => $link->title,
                    ]);
                } else {
                    $this->validCount++;
                }

            } catch (\Exception $e) {
                $this->errorCount++;

                $link->update([
                    'valid' => false,
                    'updated_at' => now(),
                ]);

                Log::error('Error checking link', [
                    'link_id' => $link->id,
                    'url' => $link->link,
                    'error' => $e->getMessage(),
                    'title' => $link->title,
                ]);
            }
        }
    }

    private function displaySummary(): void
    {
        $this->newLine();
        $this->info('Link Check Summary:');
        $this->table(
            ['Status', 'Count'],
            [
                ['Total Checked', $this->checkedCount],
                ['Valid Links', $this->validCount],
                ['Invalid Links', $this->invalidCount],
                ['Errors', $this->errorCount],
            ]
        );

        if ($this->invalidCount > 0) {
            $this->warn("Found {$this->invalidCount} invalid links. These have been marked as invalid.");
        }

        if ($this->errorCount > 0) {
            $this->error("Encountered {$this->errorCount} errors while checking links. Check the logs for details.");
        }

        $this->info('Link validation check completed!');
    }

    private function checkSingleLink(Link $link, int $timeout): void
    {
        $this->checkedCount++;

        try {
            $response = Http::timeout($timeout)
                ->withUserAgent('Mozilla/5.0 (compatible; CatalystExplorer/2.0; +https://catalystexplorer.com)')
                ->withOptions([
                    'allow_redirects' => [
                        'max' => 3,
                        'strict' => false,
                    ],
                    'verify' => false,
                    'connect_timeout' => 5,
                ])
                ->head($link->link);

            $statusCode = $response->status();
            $isValid = $response->successful() || in_array($statusCode, [403, 405, 999]);

            $link->update([
                'valid' => $isValid,
                'updated_at' => now(),
            ]);

            if (! $isValid) {
                $this->invalidCount++;
                Log::warning('Invalid link found', [
                    'link_id' => $link->id,
                    'url' => $link->link,
                    'status_code' => $statusCode,
                    'title' => $link->title,
                ]);
            } else {
                $this->validCount++;
            }

        } catch (\Exception $e) {
            $this->errorCount++;

            $link->update([
                'valid' => false,
                'updated_at' => now(),
            ]);

            Log::error('Error checking single link', [
                'link_id' => $link->id,
                'url' => $link->link,
                'error' => $e->getMessage(),
                'title' => $link->title,
            ]);
        }
    }
}
