<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\Campaign;
use App\Models\CatalystProfile;
use App\Models\Fund;
use App\Models\Link;
use App\Models\Proposal;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Fluent;
use Illuminate\Support\Str;
use League\HTMLToMarkdown\HtmlConverter;

class SyncProposalJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    private string $proposalId;

    private Fluent $documentMeta;

    private $signatures;

    public function __construct(
        public $proposalDetail,
        public string $fund,
        public ?string $documentId = null,
        public Fluent|string|null $documentVersion = null
    ) {
        // Store signatures before reassigning proposalDetail
        $this->signatures = $proposalDetail['signatures'] ?? null;

        $this->proposalDetail = toFluentDeep($proposalDetail['payload'][1] ?? []);
        $this->documentMeta = toFluentDeep($proposalDetail['payload'][0]['payload'] ?? []);

        if ($this->documentVersion !== null && ! is_string($this->documentVersion)) {
            $this->documentVersion = (string) $this->documentVersion?->ver;
        }
    }

    public function handle(): void
    {
        try {
            if (! isset($this->proposalDetail->summary) ||
                ! isset($this->proposalDetail->setup) ||
                ! isset($this->proposalDetail->setup->title) ||
                ! isset($this->proposalDetail->setup->proposer)) {
                throw new \Exception('Proposal data missing required fields: summary, setup, title, or proposer');
            }

            $proposalSummary = $this->proposalDetail->summary;
            $categoryUuid = $this->documentMeta->category_id[0] ?? null;
            $campaignId = null;

            // Find campaign by category UUID
            if ($categoryUuid) {
                $campaign = Campaign::whereHas('metas', function ($query) use ($categoryUuid) {
                    $query->where('content', 'ilike', "%{$categoryUuid}%");
                })->first();
                $campaignId = $campaign?->id;
            }
            // Verify campaign exists and belongs to the right fund
            $campaign = Campaign::where('id', $campaignId)
                ->where('fund_id', $this->fund)
                ->first();

            if (! $campaign) {
                throw new \Exception("Campaign not found or doesn't belong to fund {$this->fund}");
            }

            // Process content from multiple sources
            $content = $this->processContent(
                $this->proposalDetail->details ?? [],
                $this->proposalDetail->campaign_category->category_questions ?? [],
                $this->proposalDetail->pitch ?? []
            );

            $title = $this->proposalDetail->setup->title->title ?? 'Untitled';
            $fundNumber = $this->getFundNumber($this->fund);
            $slug = Str::slug($title.'-f'.$fundNumber);

            // Find existing proposal by document ID first, then by slug
            $proposal = null;

            if ($this->documentId) {
                $proposal = Proposal::whereHas('metas', function ($query) {
                    $query->where('key', 'catalyst_document_id')
                        ->where('content', $this->documentId);
                })->first();
            }

            if (! $proposal) {
                $proposal = Proposal::where('slug', $slug)
                    ->where('fund_id', $this->fund)
                    ->first();
            }

            if (! $proposal) {
                throw new \Exception("Proposal not found. Document ID: {$this->documentId}, Slug: {$slug}, Fund: {$this->fund}");
            }

            $data = [
                'title' => ['en' => $title],
                'problem' => ['en' => $proposalSummary->problem->statement ?? ''],
                'solution' => ['en' => $proposalSummary->solution->summary ?? ''],
                'content' => ['en' => $content],
                'amount_requested' => $proposalSummary->budget->requestedFunds ?? 0,
                'campaign_id' => $campaign->id,
                'slug' => $slug,
                'updated_at' => now(),
            ];

            $shouldUpdate = true;

            if ($this->documentVersion) {
                $existingVersion = $proposal->getMeta('catalyst_document_version');
                if ($existingVersion) {
                    $shouldUpdate = $this->isNewerUuidV7($this->documentVersion, $existingVersion);
                }
            }

            if ($shouldUpdate) {
                $proposal->update($data);
                $this->proposalId = $proposal->id;
                Log::info('Updated existing proposal', ['id' => $this->proposalId]);
            } else {
                throw new \Exception('Proposal sync skipped - existing version is newer or equal (existing: '.($existingVersion ?? 'none').', incoming: '.($this->documentVersion ?? 'none').')');
            }

            // Process comprehensive metadata, tags, and author
            $this->processMetas(
                $proposalSummary->time->duration ?? null,
                $this->proposalDetail->setup->proposer->type ?? null,
                $proposalSummary->open_source->isOpenSource ?? null
            );

            $this->processPrimaryAuthor($this->proposalDetail->setup->proposer ?? null, $this->signatures);

            $this->processTags($this->proposalDetail->theme->theme->grouped_tag ?? []);

            // Process and extract web links from proposal content and metadata
            $this->processLinks($content, $this->proposalDetail);

            // Generate projectcatalyst.io link if we have the necessary data
            $this->generateProjectCatalystLink($proposal, $campaign, $fundNumber);

        } catch (\Throwable $e) {
            Log::error('Error syncing proposal: '.$e->getMessage(), [
                'document_id' => $this->documentId,
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    protected function processContent($content, $category_questions, $pitch)
    {
        if (! class_exists(HtmlConverter::class)) {
            // Fallback if HTMLToMarkdown is not available
            return collect([$content, $category_questions, $pitch])
                ->flatten()
                ->filter()
                ->map(function ($item) {
                    return is_string($item) ? $item : json_encode($item);
                })
                ->implode("\n\n");
        }

        $converter = new HtmlConverter;
        $flatContent = collect($content)->mapWithKeys(function ($section) {
            if (is_object($section)) {
                $key = collect($section->toArray())->keys()->first();
                $value = $section->{$key} ?? '';

                return [$key => $value];
            }

            return is_array($section) ? $section : ['content' => $section];
        });

        $flatCategoryQuestions = collect($category_questions)->mapWithKeys(function ($value, $key) {
            return [$key => $value];
        });

        $flatpitch = collect($pitch)->mapWithKeys(function ($value, $key) {
            if ($value instanceof \Illuminate\Support\Fluent) {
                return [$key => collect($value->getAttributes())->first()];
            }

            return [$key => $value];
        });

        $merged = $flatContent->merge([...$flatpitch, ...$flatCategoryQuestions]);

        return $merged->map(function ($value, $key) use ($converter) {
            $html = '<h3 class="mt-6">['.Str::headline($key).']</h3>'
                .nl2br(trim($value)).'<br /><br />';

            return $converter->convert($html);
        })->implode("\n\n");
    }

    protected function processTags($groupTags): void
    {
        if (empty($groupTags)) {
            return;
        }

        try {
            $tagIds = collect($groupTags)->map(function ($tag) {
                $slug = Str::slug($tag);

                $existingTag = \App\Models\Tag::where('slug', $slug)->first();
                if (! $existingTag) {
                    $existingTag = \App\Models\Tag::create([
                        'id' => (string) Str::uuid(),
                        'slug' => $slug,
                        'title' => ucfirst($tag),
                        'meta_title' => ucfirst($tag),
                    ]);
                }

                return $existingTag->id;
            })->filter();

            $proposal = Proposal::find($this->proposalId);
            if ($proposal) {
                $proposal->tags()->syncWithoutDetaching($tagIds);
            }
        } catch (\Throwable $e) {
            Log::error('processTags failed', [
                'proposalId' => $this->proposalId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    protected function processMetas($project_length, $applicant_type, $opensource): void
    {
        try {
            $proposal = Proposal::find($this->proposalId);
            if (! $proposal) {
                return;
            }

            // Save project metadata
            if ($project_length !== null) {
                $proposal->saveMeta('project_length', $project_length, $proposal, true);
            }
            if ($applicant_type !== null) {
                $proposal->saveMeta('applicant_type', $applicant_type, $proposal, true);
            }
            if ($opensource !== null) {
                $proposal->saveMeta('opensource', $opensource, $proposal, true);
            }

            // Add catalyst document ID if provided
            if ($this->documentId) {
                $proposal->saveMeta('catalyst_document_id', $this->documentId, $proposal, true);
            }

            // Add document version if provided
            if ($this->documentVersion) {
                $proposal->saveMeta('catalyst_document_version', $this->documentVersion, $proposal, true);
            }
        } catch (\Throwable $e) {
            Log::error('processMetas failed', [
                'proposalId' => $this->proposalId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    protected function processPrimaryAuthor($data, $signatures): void
    {
        if (! $data || ! isset($data->applicant)) {
            Log::warning('processPrimaryAuthor: no applicant data');

            return;
        }

        try {
            $existingProfile = CatalystProfile::where('name', $data->applicant)->first();

            // Check if signatures exist and are not empty
            if (! $signatures || (! is_array($signatures) && ! is_object($signatures))) {
                Log::warning('processPrimaryAuthor: signatures are null or invalid', [
                    'proposalId' => $this->proposalId,
                    'signatures_type' => gettype($signatures),
                ]);

                return;
            }

            // Convert to array if it's a Fluent object
            if ($signatures instanceof \Illuminate\Support\Fluent) {
                $signatures = $signatures->toArray();
            }

            // Check if we have at least one signature
            if (empty($signatures) || ! isset($signatures[0])) {
                Log::warning('processPrimaryAuthor: no signatures available', [
                    'proposalId' => $this->proposalId,
                    'signatures_count' => is_countable($signatures) ? count($signatures) : 'not_countable',
                ]);

                return;
            }

            $signature = $signatures[0];
            if (is_array($signature)) {
                $signature = (object) $signature;
            }

            if (! isset($signature->kid)) {
                Log::warning('processPrimaryAuthor: signature missing kid property');

                return;
            }

            if (! $existingProfile) {
                $existingProfile = CatalystProfile::create([
                    'id' => (string) Str::uuid(),
                    'username' => Str::slug($data->applicant),
                    'name' => $data->applicant,
                    'catalyst_id' => $signature->kid,
                ]);
            }

            // Link profile to proposal
            $proposal = Proposal::find($this->proposalId);
            if ($proposal && $existingProfile) {
                $proposal->catalyst_profiles()->syncWithoutDetaching([$existingProfile->id]);
            }
        } catch (\Throwable $e) {
            Log::error('processPrimaryAuthor failed', [
                'proposalId' => $this->proposalId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    /**
     * Extract fund number from fund UUID
     */
    protected function getFundNumber(string $fundId): string
    {
        try {
            $fund = Fund::where('id', $fundId)->first();

            if ($fund && isset($fund->title)) {
                if (preg_match('/Fund (\d+)/', $fund->title, $matches)) {
                    return $matches[1];
                }
            }
        } catch (\Throwable $e) {
            Log::error('getFundNumber failed', [
                'fund_id' => $fundId,
                'error' => $e->getMessage(),
            ]);
        }

        // Default fallback
        return '15';
    }

    /**
     * Compare two UUID v7 strings to determine if the first is newer than the second
     */
    protected function isNewerUuidV7(string $incomingVersion, string $existingVersion): bool
    {
        try {
            if (! $this->isValidUuidV7($incomingVersion) || ! $this->isValidUuidV7($existingVersion)) {
                Log::warning('Invalid UUID v7 format, defaulting to update', [
                    'incoming' => $incomingVersion,
                    'existing' => $existingVersion,
                ]);

                return true;
            }

            // Extract timestamp from UUID v7 (first 48 bits)
            $incomingTimestamp = $this->extractTimestampFromUuidV7($incomingVersion);
            $existingTimestamp = $this->extractTimestampFromUuidV7($existingVersion);

            // Compare timestamps
            return $incomingTimestamp > $existingTimestamp;
        } catch (\Throwable $e) {
            Log::error('Error comparing UUID v7 versions', [
                'incoming' => $incomingVersion,
                'existing' => $existingVersion,
                'error' => $e->getMessage(),
            ]);

            return true;
        }
    }

    /**
     * Validate if a UUID string is a valid v7 format
     */
    protected function isValidUuidV7(string $uuid): bool
    {
        // Check basic UUID format
        if (! preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', $uuid)) {
            return false;
        }

        // Check if it's version 7 (13th character should be '7')
        return strtolower($uuid[14]) === '7';
    }

    /**
     * Extract timestamp from UUID v7 (first 48 bits as milliseconds since Unix epoch)
     */
    protected function extractTimestampFromUuidV7(string $uuidV7): int
    {
        // Remove hyphens and get the first 12 hex characters (48 bits)
        $hex = str_replace('-', '', $uuidV7);
        $timestampHex = substr($hex, 0, 12);

        // Convert hex to decimal (timestamp in milliseconds)
        return hexdec($timestampHex);
    }

    /**
     * Get timestamp from UUID v7 as a Carbon instance for database use
     */
    protected function getTimestampFromUuidV7(string $uuidV7): Carbon
    {
        try {
            $timestampMs = $this->extractTimestampFromUuidV7($uuidV7);
            $timestampSeconds = $timestampMs / 1000;

            return Carbon::createFromTimestamp($timestampSeconds);
        } catch (\Throwable $e) {
            Log::error('Error converting UUID v7 to Carbon timestamp', [
                'uuid_v7' => $uuidV7,
                'error' => $e->getMessage(),
            ]);

            return now();
        }
    }

    /**
     * Extract and process web links from proposal content and metadata
     */
    protected function processLinks(string $content, $proposalDetail = null): void
    {
        try {
            $proposal = Proposal::find($this->proposalId);
            if (! $proposal) {
                return;
            }

            $linkIds = [];
            $extractedUrls = [];

            $contentUrls = $this->extractUrlsFromText($content);
            $extractedUrls = array_merge($extractedUrls, $contentUrls);

            if ($proposalDetail) {
                $structuredUrls = $this->extractUrlsFromStructuredData($proposalDetail);
                $extractedUrls = array_merge($extractedUrls, $structuredUrls);
            }

            $extractedUrls = $this->cleanAndValidateUrls($extractedUrls);

            foreach ($extractedUrls as $urlData) {
                $link = $this->createOrUpdateLink($urlData);
                if ($link) {
                    $linkIds[] = $link->id;
                }
            }

            if (! empty($linkIds)) {
                // Prepare pivot data with model_type
                $pivotData = [];
                foreach ($linkIds as $linkId) {
                    $pivotData[$linkId] = ['model_type' => Proposal::class];
                }
                $proposal->links()->sync($pivotData);
                Log::info('Successfully synced links for proposal', [
                    'proposal_id' => $this->proposalId,
                    'links_count' => count($linkIds),
                ]);
            } else {
                $proposal->links()->detach();
            }

        } catch (\Throwable $e) {
            Log::error('processLinks failed', [
                'proposal_id' => $this->proposalId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
        }
    }

    /**
     * Extract URLs from text content using regex patterns
     */
    protected function extractUrlsFromText(string $content): array
    {
        $urls = [];

        // Comprehensive URL regex pattern
        $pattern = '/(?:(?:https?:\/\/)?(?:[a-zA-Z0-9\-\_]+\.)+[a-zA-Z]{2,}(?:\/[^\s]*)?)/i';

        if (preg_match_all($pattern, $content, $matches)) {
            foreach ($matches[0] as $url) {
                // Clean up the URL
                $url = trim($url, '.,;:!?)"\']');

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
     * Extract URLs from structured proposal data
     */
    protected function extractUrlsFromStructuredData($data): array
    {
        $urls = [];

        if (! $data) {
            return $urls;
        }

        // Convert to array for easier processing
        $dataArray = $data instanceof Fluent ? $data->toArray() : (array) $data;

        // Look for URLs in various fields
        $this->extractUrlsRecursively($dataArray, $urls, 'metadata');

        return $urls;
    }

    /**
     * Recursively extract URLs from nested data structures
     */
    protected function extractUrlsRecursively($data, &$urls, string $context, string $currentPath = ''): void
    {
        try {
            if (is_string($data)) {
                // Check if this string contains URLs
                $extractedUrls = $this->extractUrlsFromText($data);
                foreach ($extractedUrls as $urlData) {
                    $urlData['context'] = $context;
                    $urlData['path'] = $currentPath;
                    $urls[] = $urlData;
                }
            } elseif (is_array($data) || is_object($data)) {
                $dataArray = is_object($data) ? (array) $data : $data;
                foreach ($dataArray as $key => $value) {
                    // Skip null or invalid keys/values
                    if ($key === null || $value === null) {
                        continue;
                    }

                    $newPath = $currentPath ? $currentPath.'.'.(string) $key : (string) $key;

                    // Special handling for fields that commonly contain links
                    if (is_string($key) && is_string($value)) {
                        $lowerKey = strtolower($key);
                        if (in_array($lowerKey, ['url', 'link', 'website', 'homepage', 'github', 'twitter', 'linkedin'])) {
                            if (filter_var($value, FILTER_VALIDATE_URL) || preg_match('/^https?:\/\//i', $value)) {
                                $urls[] = [
                                    'url' => $value,
                                    'type' => $this->categorizeUrl($value),
                                    'context' => $context,
                                    'label' => ucfirst($key),
                                    'path' => $newPath,
                                ];

                                continue;
                            }
                        }
                    }

                    // Recursively process nested structures (with depth limit)
                    $depth = substr_count($currentPath, '.');
                    if ($depth < 10) { // Limit recursion depth to prevent infinite loops
                        $this->extractUrlsRecursively($value, $urls, $context, $newPath);
                    }
                }
            }
        } catch (\Throwable $e) {
            // Log the error but don't let it stop the entire process
            Log::warning('Error in extractUrlsRecursively', [
                'error' => $e->getMessage(),
                'context' => $context,
                'path' => $currentPath,
                'data_type' => gettype($data),
            ]);
        }
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

            // Validate URL first
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

            // Skip localhost and internal URLs in production
            if (preg_match('/\b(localhost|127\.0\.0\.1|192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[01])\.)/', $url)) {
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
     */
    protected function createOrUpdateLink(array $urlData): ?Link
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

            return $link;

        } catch (\Throwable $e) {
            Log::warning('Failed to create/update link', [
                'url' => $urlData['url'] ?? 'unknown',
                'error' => $e->getMessage(),
            ]);

            return null;
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

    /**
     * Generate ProjectCatalyst.io link using campaign slug and proposal title
     */
    protected function generateProjectCatalystLink(Proposal $proposal, Campaign $campaign, string $fundNumber): void
    {
        try {
            if (! $campaign->slug || ! $proposal->title) {
                Log::debug('Cannot generate projectcatalyst.io link - missing required data', [
                    'proposal_id' => $proposal->id,
                    'has_campaign_slug' => ! empty($campaign->slug),
                    'has_proposal_title' => ! empty($proposal->title),
                    'has_projectcatalyst_io_slug_meta' => ! empty($campaign->getMeta('projectcatalyst_io_slug')),
                ]);

                return;
            }

            // First try to get the actual ProjectCatalyst.io slug from campaign metas
            $campaignSlug = $campaign->getMeta('projectcatalyst_io_slug');

            // If not found in metas, fall back to extracting from campaign slug
            if (! $campaignSlug) {
                $campaignSlug = $campaign->slug;
                $fundSuffix = '-f'.$fundNumber;
                if (str_ends_with($campaignSlug, $fundSuffix)) {
                    $campaignSlug = substr($campaignSlug, 0, -strlen($fundSuffix));
                }

                Log::debug('Using fallback campaign slug extraction', [
                    'proposal_id' => $proposal->id,
                    'original_slug' => $campaign->slug,
                    'extracted_slug' => $campaignSlug,
                    'fund_number' => $fundNumber,
                ]);
            } else {
                Log::debug('Using campaign meta projectcatalyst_io_slug', [
                    'proposal_id' => $proposal->id,
                    'campaign_slug' => $campaignSlug,
                    'campaign_id' => $campaign->id,
                ]);
            }

            $titleForSlug = str_replace('&', 'and', $proposal->title);
            $projectSlug = Str::slug($titleForSlug);

            $projectCatalystUrl = "https://projectcatalyst.io/funds/{$fundNumber}/{$campaignSlug}/{$projectSlug}";

            // Only update if the link is different from current
            if ($proposal->projectcatalyst_io_link !== $projectCatalystUrl) {
                $proposal->projectcatalyst_io_link = $projectCatalystUrl;
                $proposal->save();

                Log::info('Updated proposal projectcatalyst.io link', [
                    'proposal_id' => $proposal->id,
                    'old_link' => $proposal->getOriginal('projectcatalyst_io_link'),
                    'new_link' => $projectCatalystUrl,
                    'campaign_slug' => $campaignSlug,
                    'campaign_slug_source' => $campaign->getMeta('projectcatalyst_io_slug') ? 'meta' : 'extracted',
                    'project_slug' => $projectSlug,
                    'fund_number' => $fundNumber,
                ]);
            }

        } catch (\Throwable $e) {
            Log::error('Failed to generate projectcatalyst.io link', [
                'proposal_id' => $proposal->id ?? null,
                'campaign_id' => $campaign->id ?? null,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
        }
    }
}
