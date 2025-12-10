<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\Campaign;
use App\Models\CatalystProfile;
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

    protected function processTags($groupTags)
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

    protected function processMetas($project_length, $applicant_type, $opensource)
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

    protected function processPrimaryAuthor($data, $signatures)
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
            $fund = \App\Models\Fund::where('id', $fundId)->first();

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
}
