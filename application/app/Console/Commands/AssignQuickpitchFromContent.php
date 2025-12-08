<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Fund;
use App\Models\Proposal;
use App\Services\VideoService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AssignQuickpitchFromContent extends Command
{
    protected $signature = 'proposals:assign-quickpitch
                            {--fund= : Fund slug, label, or id to scope proposals (defaults to Fund 15)}
                            {--apply : Persist changes (otherwise dry-run)}
                            {--limit=0 : Optional max number of proposals to process}
                            {--force : Reprocess all proposals including those with existing quickpitch}
                            {--debug : Show debug output for content parsing}';

    protected $description = 'Scan proposals in a Fund for YouTube links in content/solution and assign quickpitch where missing (only videos under 5 minutes).';

    public function __construct(private readonly VideoService $videoService)
    {
        parent::__construct();
    }

    public function handle(): int
    {
        $fundInput = $this->option('fund');

        $fund = $this->resolveFund($fundInput);
        if (! $fund) {
            $this->error('Fund not found. Provide a valid --fund (id, slug, label, or title).');

            return self::FAILURE;
        }

        $this->info(sprintf('Scanning proposals for fund: %s (%s)', $fund->title ?? $fund->label ?? $fund->id, $fund->id));

        $query = Proposal::query()
            ->where('fund_id', $fund->id)
            ->select(['id', 'title', 'content', 'solution', 'quickpitch', 'fund_id']);

        // Only filter out existing quickpitch if not forcing reprocessing
        if (! $this->option('force')) {
            $query->whereNull('quickpitch');
        }

        $limit = (int) $this->option('limit');
        if ($limit > 0) {
            $query->limit($limit);
        }

        $total = 0;
        $updated = 0;
        $skipped = 0;
        $dryRun = ! $this->option('apply');
        $debug = $this->option('debug');

        $youtubeRegex = '/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/|[^\/]+\/.+\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i';

        $query->chunkById(200, function ($proposals) use (&$total, &$updated, &$skipped, $dryRun, $youtubeRegex, $debug) {
            foreach ($proposals as $proposal) {
                $total++;

                // Collect searchable text from translatable fields
                $texts = $this->collectTranslatableTexts($proposal, ['content', 'solution']);
                $blob = implode("\n\n", array_filter($texts));

                if ($debug) {
                    $this->info("[debug] {$proposal->id} extracted text length: ".strlen($blob));
                    if ($blob && (strpos($blob, 'youtu.be') !== false || strpos($blob, 'youtube.com') !== false)) {
                        $this->warn("[debug] {$proposal->id} contains YouTube reference!");
                        // Show first 500 chars containing youtube
                        $pos = max(strpos($blob, 'youtu.be') ?: 0, strpos($blob, 'youtube.com') ?: 0);
                        if ($pos !== false) {
                            $start = max(0, $pos - 100);
                            $snippet = substr($blob, $start, 500);
                            $this->line('[debug] Snippet: '.substr($snippet, 0, 200).'...');
                        }
                    }
                }

                if (! $blob) {
                    $this->line("[skip] {$proposal->id} has no content/solution text");
                    $skipped++;

                    continue;
                }

                // Find all YouTube URLs
                $urls = $this->findAllYouTubeUrls($blob, $youtubeRegex);
                if (empty($urls)) {
                    $this->line("[skip] {$proposal->id} no YouTube link found");
                    $skipped++;

                    continue;
                }

                if ($debug) {
                    $this->info("[debug] {$proposal->id} found ".count($urls).' YouTube URLs: '.implode(', ', $urls));
                }

                // Find the best URL (shortest valid video under 5 minutes)
                $bestUrl = $this->findBestYouTubeUrl($urls, $debug ? $proposal->id : null);
                if (! $bestUrl) {
                    $this->line("[skip] {$proposal->id} no suitable YouTube video found");
                    $skipped++;

                    continue;
                }

                $url = $bestUrl['url'];
                $duration = $bestUrl['duration'];

                $normalized = $this->videoService->normalizeYouTubeUrl($url);

                // Normalize the selected URL
                $normalized = $this->videoService->normalizeYouTubeUrl($url);

                // Skip if already has this exact quickpitch URL (when using --force)
                if ($proposal->quickpitch === $normalized) {
                    $this->line("[skip] {$proposal->id} already has this quickpitch URL");
                    $skipped++;

                    continue;
                }

                if ($dryRun) {
                    $this->info("[dry] would set quickpitch for {$proposal->id} -> {$normalized} (duration: ".($duration ?? 'n/a').')');
                    $updated++;
                } else {
                    DB::beginTransaction();
                    try {
                        $proposal->update([
                            'quickpitch' => $normalized,
                            'quickpitch_length' => $duration,
                        ]);

                        $proposal->searchable();

                        DB::commit();
                        $this->info("[ok] set quickpitch for {$proposal->id} -> {$normalized} (duration: ".($duration ?? 'n/a').') + indexed');
                        $updated++;
                    } catch (\Throwable $e) {
                        DB::rollBack();
                        Log::error('Failed to update proposal quickpitch', [
                            'proposal_id' => $proposal->id,
                            'url' => $normalized,
                            'error' => $e->getMessage(),
                        ]);
                        $this->error("[err] failed to set quickpitch for {$proposal->id}: {$e->getMessage()}");
                    }
                }
            }
        });

        $this->newLine();
        $this->table(['Total scanned', 'Updated', 'Skipped', 'Mode'], [[
            $total, $updated, $skipped, $dryRun ? 'dry-run' : 'apply',
        ]]);

        return self::SUCCESS;
    }

    private function resolveFund(?string $input): ?Fund
    {
        if ($input) {
            return Fund::query()
                ->where('id', $input)
                ->orWhere('slug', $input)
                ->orWhere('label', 'ILIKE', "%{$input}%")
                ->orWhere('title', 'ILIKE', "%{$input}%")
                ->first();
        }

        return Fund::query()
            ->where(function ($q) {
                $q->where('label', 'ILIKE', '%15%')
                    ->orWhere('title', 'ILIKE', '%15%');
            })
            ->orderByDesc('created_at')
            ->first();
    }

    private function collectTranslatableTexts(Proposal $proposal, array $fields): array
    {
        $texts = [];
        foreach ($fields as $field) {
            $raw = $proposal->{$field};
            if (is_array($raw)) {
                foreach ($raw as $locale => $text) {
                    if (is_string($text) && trim($text) !== '') {
                        $texts[] = $text;
                    }
                }
            } elseif (is_string($raw) && trim($raw) !== '') {
                $texts[] = $raw;
            } elseif (is_string($rawJson = (string) $raw)) {
                $decoded = json_decode($rawJson, true);
                if (is_array($decoded)) {
                    foreach ($decoded as $locale => $text) {
                        if (is_string($text) && trim($text) !== '') {
                            $texts[] = $text;
                        }
                    }
                }
            }
        }

        return $texts;
    }

    private function firstYouTubeUrl(string $text, string $regex): ?string
    {
        // Improved URL pattern to handle more cases and avoid markdown artifacts
        $urlPattern = '/https?:\/\/[^\s)\]\}"\'>]+/i';
        if (preg_match_all($urlPattern, $text, $matches)) {
            foreach ($matches[0] as $candidate) {
                // Clean up potential markdown/punctuation artifacts
                $cleanCandidate = rtrim($candidate, '.,;!?)]}"\'');
                if (preg_match($regex, $cleanCandidate, $m)) {
                    return $cleanCandidate;
                }
            }
        }

        // Backup: run regex over whole text to catch edge cases
        if (preg_match($regex, $text, $m)) {
            // Try to extract the full URL match if possible
            $fullMatch = $m[0] ?? null;
            if ($fullMatch && filter_var($fullMatch, FILTER_VALIDATE_URL)) {
                return $fullMatch;
            }
            // Fallback: rebuild from video ID
            $videoId = $m[1] ?? null;

            return $videoId ? "https://youtu.be/{$videoId}" : null;
        }

        return null;
    }

    private function findAllYouTubeUrls(string $text, string $regex): array
    {
        $urls = [];

        // Find all URLs first
        $urlPattern = '/https?:\/\/[^\s)\]\}"\'>]+/i';
        if (preg_match_all($urlPattern, $text, $matches)) {
            foreach ($matches[0] as $candidate) {
                // Clean up potential markdown/punctuation artifacts
                $cleanCandidate = rtrim($candidate, '.,;!?)]}"\'');
                if (preg_match($regex, $cleanCandidate, $m)) {
                    $urls[] = $cleanCandidate;
                }
            }
        }

        // Also try direct regex matching for edge cases
        if (preg_match_all($regex, $text, $matches, PREG_SET_ORDER)) {
            foreach ($matches as $match) {
                $fullMatch = $match[0] ?? null;
                if ($fullMatch && ! in_array($fullMatch, $urls)) {
                    $urls[] = $fullMatch;
                }
                // Also try rebuilding from video ID if full match isn't a valid URL
                if ($fullMatch && ! filter_var($fullMatch, FILTER_VALIDATE_URL)) {
                    $videoId = $match[1] ?? null;
                    if ($videoId) {
                        $rebuiltUrl = "https://youtu.be/{$videoId}";
                        if (! in_array($rebuiltUrl, $urls)) {
                            $urls[] = $rebuiltUrl;
                        }
                    }
                }
            }
        }

        return array_unique($urls);
    }

    private function findBestYouTubeUrl(array $urls, ?string $debugProposalId = null): ?array
    {
        $candidates = [];

        foreach ($urls as $url) {
            // Convert YouTube Shorts URLs to standard format
            if (preg_match('/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/i', $url, $matches)) {
                $url = "https://youtu.be/{$matches[1]}";
            }

            try {
                $metadata = $this->videoService->getVideoMetadata($url);
                $duration = $metadata['duration'] ?? null;

                // Only consider videos under 5 minutes (300 seconds)
                if ($duration && $duration <= 300) {
                    $candidates[] = [
                        'url' => $url,
                        'duration' => $duration,
                        'metadata' => $metadata,
                    ];

                    if ($debugProposalId) {
                        $this->line("[debug] {$debugProposalId} valid candidate: {$url} ({$duration}s)");
                    }
                } else {
                    if ($debugProposalId) {
                        $durStr = $duration ? "{$duration}s" : 'unknown';
                        $this->line("[debug] {$debugProposalId} too long: {$url} ({$durStr})");
                    }
                }
            } catch (\Throwable $e) {
                if ($debugProposalId) {
                    $this->line("[debug] {$debugProposalId} metadata failed: {$url} - {$e->getMessage()}");
                }
                // Log but continue to next URL
                Log::debug('Video metadata fetch failed during URL evaluation', [
                    'proposal_id' => $debugProposalId,
                    'url' => $url,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        if (empty($candidates)) {
            return null;
        }

        // Sort by duration (shortest first) and return the best one
        usort($candidates, fn ($a, $b) => $a['duration'] <=> $b['duration']);

        return $candidates[0];
    }
}
