<?php

declare(strict_types=1);

namespace App\Nova\Actions;

use App\Models\Link;
use App\Models\Proposal;
use Illuminate\Bus\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Laravel\Nova\Actions\Action;
use Laravel\Nova\Actions\ActionResponse;
use Laravel\Nova\Fields\ActionFields;

/**
 * Nova action to scan through proposal content and solution fields to generate link relations.
 *
 * This action extracts URLs from proposal content, problem, and solution text fields,
 * validates and normalizes them, creates Link records, and associates them with proposals
 * via the model_links pivot table. It prevents duplicates by checking for existing
 * links and using syncWithoutDetaching for the relationships.
 *
 * The link extraction and processing logic is based on SyncProposalJob::processLinks.
 */
class GenerateProposalLinks extends Action
{
    use InteractsWithQueue, Queueable;

    /**
     * The displayable name of the action.
     */
    public $name = 'Generate Links from Content';

    /**
     * Perform the action on the given models.
     */
    public function handle(ActionFields $fields, Collection $models): ActionResponse
    {
        $processedCount = 0;
        $linksCreated = 0;
        $linksUpdated = 0;
        $errors = [];

        foreach ($models as $proposal) {
            try {
                $result = $this->processProposalLinks($proposal);
                $processedCount++;
                $linksCreated += $result['created'];
                $linksUpdated += $result['updated'];
            } catch (\Throwable $e) {
                $errors[] = "Proposal {$proposal->id}: {$e->getMessage()}";
                Log::error('GenerateProposalLinks failed for proposal', [
                    'proposal_id' => $proposal->id,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                ]);
            }
        }

        $message = "Processed {$processedCount} proposals. Created {$linksCreated} new links, updated {$linksUpdated} existing links.";

        if (! empty($errors)) {
            $message .= ' Errors: '.implode('; ', array_slice($errors, 0, 3));
            if (count($errors) > 3) {
                $message .= ' (and '.(count($errors) - 3).' more)';
            }
        }

        return Action::message($message);
    }

    /**
     * Process links for a single proposal
     */
    protected function processProposalLinks(Proposal $proposal): array
    {
        $linkIds = [];
        $extractedUrls = [];
        $created = 0;
        $updated = 0;

        // Extract URLs from proposal content
        $content = $proposal->getTranslation('content', 'en') ?? '';
        $solution = $proposal->getTranslation('solution', 'en') ?? '';
        $problem = $proposal->getTranslation('problem', 'en') ?? '';

        // Combine all text content
        $combinedContent = implode("\n\n", array_filter([$content, $solution, $problem]));

        if (! empty($combinedContent)) {
            $contentUrls = $this->extractUrlsFromText($combinedContent);
            $extractedUrls = array_merge($extractedUrls, $contentUrls);
        }

        // Clean and validate URLs
        $extractedUrls = $this->cleanAndValidateUrls($extractedUrls);

        // Create or update links
        foreach ($extractedUrls as $urlData) {
            $result = $this->createOrUpdateLink($urlData);
            if ($result['link']) {
                $linkIds[] = $result['link']->id;
                if ($result['created']) {
                    $created++;
                } else {
                    $updated++;
                }
            }
        }

        // Sync links with proposal (avoid duplicates)
        if (! empty($linkIds)) {
            // Prepare pivot data with model_type
            $pivotData = [];
            foreach ($linkIds as $linkId) {
                $pivotData[$linkId] = ['model_type' => Proposal::class];
            }

            // Use syncWithoutDetaching to avoid removing existing links and prevent duplicates
            $proposal->links()->syncWithoutDetaching($pivotData);

            Log::info('Successfully synced links for proposal', [
                'proposal_id' => $proposal->id,
                'links_count' => count($linkIds),
                'new_links_created' => $created,
                'links_updated' => $updated,
            ]);
        }

        return [
            'created' => $created,
            'updated' => $updated,
        ];
    }

    /**
     * Extract URLs from text content using regex patterns
     */
    protected function extractUrlsFromText(string $content): array
    {
        $urls = [];

        $pattern = '/(?:(?:https?:\/\/)?(?:[a-zA-Z0-9\-\_]+\.)+[a-zA-Z]{2,}(?:\/[^\s]*)?)/i';

        if (preg_match_all($pattern, $content, $matches)) {
            foreach ($matches[0] as $url) {
                // Clean up the URL
                $url = trim($url, '.,;:!?)\"\']');

                // Add protocol if missing
                if (! preg_match('/^https?:\/\//i', $url)) {
                    $url = 'https://'.$url;
                }

                $urls[] = [
                    'url' => $url,
                    'type' => $this->categorizeUrl($url),
                    'context' => 'content',
                    'label' => null,
                ];
            }
        }

        return $urls;
    }

    /**
     * Clean and validate extracted URLs
     */
    protected function cleanAndValidateUrls(array $urls): array
    {
        $cleanUrls = [];
        $seenUrls = [];

        foreach ($urls as $urlData) {
            $url = $urlData['url'];

            if (! filter_var($url, FILTER_VALIDATE_URL)) {
                continue;
            }

            // Skip obvious non-web URLs
            if (preg_match('/^(mailto:|tel:|ftp:|file:)/i', $url)) {
                continue;
            }

            // Skip schema.json files and other non-user-facing file types
            if (preg_match('/\.(schema\.json|xsd|dtd)$/i', $url)) {
                continue;
            }

            // Skip photo/image file types
            if (preg_match('/\.(jpg|jpeg|png|gif|webp|avif|svg|bmp|ico|tiff|tif)$/i', $url)) {
                continue;
            }

            // Skip localhost and internal URLs
            if (preg_match('/\b(gmail|localhost|127\.0\.0\.1|192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[01])\.)/i', $url)) {
                continue;
            }

            // Normalize URL for deduplication
            $normalizedUrl = $this->normalizeUrl($url);

            // Skip if we've already seen this normalized URL
            if (isset($seenUrls[$normalizedUrl])) {
                continue;
            }

            // Update the URL data with the normalized URL
            $urlData['url'] = $normalizedUrl;
            $seenUrls[$normalizedUrl] = true;
            $cleanUrls[] = $urlData;
        }

        return $cleanUrls;
    }

    /**
     * Normalize URL to prevent duplicates
     * - Remove trailing slashes
     * - Prefer www version for consistency
     * - Convert to lowercase
     */
    protected function normalizeUrl(string $url): string
    {
        try {
            $parsed = parse_url($url);
            if (! $parsed || ! isset($parsed['host'])) {
                return $url;
            }

            // Reconstruct URL with normalization
            $scheme = $parsed['scheme'] ?? 'https';
            $host = strtolower($parsed['host']);
            $port = isset($parsed['port']) ? ':'.$parsed['port'] : '';
            $path = isset($parsed['path']) ? rtrim($parsed['path'], '/') : '';
            $query = isset($parsed['query']) ? '?'.$parsed['query'] : '';
            $fragment = isset($parsed['fragment']) ? '#'.$parsed['fragment'] : '';

            // For common domains, prefer the www version for consistency
            if (! str_starts_with($host, 'www.') && ! in_array($host, ['github.com', 'gitlab.com', 'twitter.com', 'x.com', 'linkedin.com'])) {
                // Check if this is a domain that typically uses www
                $commonWwwDomains = ['catalystexplorer.com', 'lidonation.com'];
                foreach ($commonWwwDomains as $domain) {
                    if ($host === $domain || str_ends_with($host, '.'.$domain)) {
                        $host = 'www.'.$host;
                        break;
                    }
                }
            }

            // If path is empty, don't add trailing slash
            $normalizedUrl = $scheme.'://'.$host.$port.$path.$query.$fragment;

            return $normalizedUrl;

        } catch (\Throwable $e) {
            // If parsing fails, return original URL
            return $url;
        }
    }

    /**
     * Categorize URL by domain/pattern
     */
    protected function categorizeUrl(string $url): string
    {
        $domain = parse_url(strtolower($url), PHP_URL_HOST);

        if (! $domain) {
            return 'website';
        }

        // Social media platforms
        if (strpos($domain, 'twitter.com') !== false || strpos($domain, 'x.com') !== false) {
            return 'twitter';
        }
        if (strpos($domain, 'linkedin.com') !== false) {
            return 'linkedin';
        }
        if (strpos($domain, 'facebook.com') !== false) {
            return 'facebook';
        }
        if (strpos($domain, 'instagram.com') !== false) {
            return 'instagram';
        }
        if (strpos($domain, 'youtube.com') !== false || strpos($domain, 'youtu.be') !== false) {
            return 'youtube';
        }
        if (strpos($domain, 'telegram.org') !== false || strpos($domain, 't.me') !== false) {
            return 'telegram';
        }
        if (strpos($domain, 'discord.com') !== false) {
            return 'discord';
        }

        // Development platforms
        if (strpos($domain, 'github.com') !== false || strpos($domain, 'gitlab.com') !== false) {
            return 'repository';
        }

        // Documentation
        if (strpos($domain, 'gitbook.com') !== false || strpos($domain, 'notion.so') !== false) {
            return 'documentation';
        }

        return 'website';
    }

    /**
     * Create or update a Link record
     * Returns array with 'link' and 'created' boolean
     */
    protected function createOrUpdateLink(array $urlData): array
    {
        try {
            $url = $urlData['url'];
            $normalizedUrl = $this->normalizeUrl($url);

            // Try to find existing link by normalized URL
            $link = Link::where('link', $normalizedUrl)->first();

            // If not found, also check for the original URL (for backward compatibility)
            if (! $link && $url !== $normalizedUrl) {
                $link = Link::where('link', $url)->first();
                // If found with original URL, update it to normalized version
                if ($link) {
                    $link->update(['link' => $normalizedUrl]);
                }
            }

            $created = false;
            if (! $link) {
                // Generate title from URL if no label provided
                $title = $urlData['label'] ?: $this->generateTitleFromUrl($url);

                $link = Link::create([
                    'id' => (string) Str::uuid(),
                    'type' => $urlData['type'],
                    'link' => $normalizedUrl,
                    'label' => $urlData['label'],
                    'title' => $title, // Use simple string instead of translation array for now
                    'status' => 'published',
                    'valid' => true,
                ]);
                $created = true;
            } else {
                // Update existing link if needed
                $updates = [];
                if ($link->type !== $urlData['type']) {
                    $updates['type'] = $urlData['type'];
                }
                if ($urlData['label'] && ! $link->label) {
                    $updates['label'] = $urlData['label'];
                }

                if (! empty($updates)) {
                    $link->update($updates);
                }
            }

            return [
                'link' => $link,
                'created' => $created,
            ];

        } catch (\Throwable $e) {
            Log::warning('Failed to create/update link', [
                'url' => $urlData['url'] ?? 'unknown',
                'error' => $e->getMessage(),
            ]);

            return [
                'link' => null,
                'created' => false,
            ];
        }
    }

    /**
     * Generate a readable title from URL
     */
    protected function generateTitleFromUrl(string $url): string
    {
        $parsed = parse_url($url);
        $host = $parsed['host'] ?? '';

        // Remove www. prefix
        $host = preg_replace('/^www\./', '', $host);

        // Convert domain to title case
        $title = ucfirst(str_replace(['.com', '.org', '.io', '.net'], '', $host));

        return $title ?: 'Link';
    }
}
