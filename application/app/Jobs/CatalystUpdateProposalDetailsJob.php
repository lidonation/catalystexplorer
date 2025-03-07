<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Enums\CatalystFunds;
use App\Enums\IdeascaleBaseUrls;
use App\Models\IdeascaleProfile;
use App\Models\Link;
use App\Models\Proposal;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use League\HTMLToMarkdown\HtmlConverter;
use Spatie\MediaLibrary\MediaCollections\Exceptions\UnreachableUrl;

class CatalystUpdateProposalDetailsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected HtmlConverter $converter;

    protected array $fundConfig = [
        CatalystFunds::SEVEN()->value => [
            'solution_field' => 'CF_213',
            'details_handler' => 'handleFund7Details',
        ],
        CatalystFunds::TEN()->value => [
            'solution_field' => 'CF_213',
            'details_handler' => 'handleFund10Details',
        ],
        // Add other fund configurations
    ];

    public function __construct(
        public Proposal|int $proposal,
        public bool $includeBasicDetails = false
    ) {
        $this->converter = new HtmlConverter;
    }

    public function handle(): void
    {
        $this->proposal = $this->resolveProposalInstance();
        $ideascaleId = $this->extractIdeascaleId();

        if (! $ideascaleId) {
            Log::error('Failed to extract Ideascale ID', ['proposal' => $this->proposal->id]);

            return;
        }

        $apiData = $this->fetchIdeascaleData($ideascaleId);
        if (! $apiData) {
            return;
        }

        $this->processCoreData($apiData);
        $this->saveProposalContent($apiData);
        $this->handleAttachments($apiData->attachments);
        $this->syncRelatedData($apiData);
    }

    protected function resolveProposalInstance(): Proposal
    {
        return $this->proposal instanceof Proposal
            ? $this->proposal
            : Proposal::findOrFail($this->proposal);
    }

    protected function extractIdeascaleId(): ?int
    {
        try {
            $response = Http::get($this->proposal->ideascale_link);
            $finalUrl = $response->effectiveUri();
            $parts = explode('/', (string) $finalUrl);

            return is_numeric(end($parts)) ? (int) end($parts) : null;
        } catch (\Exception $e) {
            Log::error('Failed to extract Ideascale ID', ['error' => $e->getMessage()]);

            return null;
        }
    }

    protected function fetchIdeascaleData(int $ideascaleId): ?object
    {
        try {
            $token = Http::get(IdeascaleBaseUrls::IDEASCALE_API_BASE.'/get-token')->body();

            return Http::withToken($token)
                ->retry(3, 200)
                ->timeout(60)
                ->get(IdeascaleBaseUrls::IDEASCALE_API_BASE."/idea/{$ideascaleId}/detail")
                ->throw()
                ->object()?->data;
        } catch (\Exception $e) {
            Log::error('Failed to fetch Ideascale data', ['error' => $e->getMessage()]);

            return null;
        }
    }

    protected function processCoreData(object $data): void
    {
        $this->proposal->user()->associate($this->processAuthor($data->submitter));
        $this->proposal->users()->sync($this->getCollaborators($data));

        $this->processBasicDetails($data);
        // $this->processBudgetDetails($data);
    }

    protected function processAuthor(object $submitter): User|IdeascaleProfile
    {
        $author = IdeascaleProfile::firstOrNew(['username' => $submitter->username]);
        $author->fill([
            'name' => $submitter->name,
            'ideascale_id' => $submitter->id,
        ])->save();

        $this->updateAuthorMedia($author, $submitter->avatar);

        return $author;
    }

    protected function updateAuthorMedia(IdeascaleProfile $profile, string $avatarUrl): void
    {
        if (! $profile->hasMedia('hero')) {
            try {
                $profile->addMediaFromUrl($avatarUrl)
                    ->toMediaCollection('hero');
            } catch (UnreachableUrl $e) {
                Log::error('Failed to fetch author avatar', ['error' => $e->getMessage()]);
            }
        }
    }

    protected function getCollaborators(object $data): Collection
    {
        return collect($data->coSubmitters)
            ->map(fn ($user) => IdeascaleProfile::updateOrCreate(
                ['ideascale_id' => $user->id],
                ['username' => $user->username, 'name' => $user->name]
            )->id)
            ->prepend($this->proposal->user_id);
    }

    protected function processBasicDetails(object $data): void
    {
        $this->proposal->problem = $this->convertContent($data->description);

        if ($this->includeBasicDetails) {
            $this->proposal->solution = $this->getFieldValue($data->fieldSections, 'solution');
            $this->proposal->experience = $this->getFieldValue($data->fieldSections, 'experience');
        }
    }

    protected function convertContent(?string $content): string
    {
        return $this->converter->convert(
            Str::replace('/a/attachments/', 'https://cardano.ideascale.com/a/attachments/', $content ?? '')
        );
    }

    protected function getFieldValue(array $sections, string $fieldType): string
    {
        $fieldId = $this->fundConfig[$this->proposal->fund_id][$fieldType.'_field'] ?? null;
        $value = collect($sections)
            ->firstWhere('ideaFieldValues.0.fieldName', $fieldId)
            ?->ideaFieldValues[0]->value ?? '';

        return $this->convertContent($value);
    }

    protected function saveProposalContent(object $data): void
    {
        $handler = $this->fundConfig[$this->proposal->fund_id]['details_handler'] ?? 'handleDefaultDetails';
        $content = method_exists($this, $handler)
            ? $this->$handler($data->fieldSections)
            : $this->handleDefaultDetails($data->fieldSections);

        $this->proposal->content = Str::replace(
            '/a/attachments/',
            'https://cardano.ideascale.com/a/attachments/',
            $content
        );
    }

    protected function handleDefaultDetails(array $sections): string
    {
        return collect($sections)
            ->map(fn ($section) => $this->convertContent($section->ideaFieldValues[0]->value ?? ''))
            ->implode("\n\n");
    }

    protected function handleAttachments(array $attachments): void
    {
        if ($this->proposal->hasMedia('hero')) {
            return;
        }

        DB::transaction(function () use ($attachments) {
            collect($attachments)->each(function ($attachment) {
                try {
                    $this->proposal->addMediaFromUrl($attachment->url)
                        ->preservingOriginal()
                        ->usingName($attachment->filename)
                        ->toMediaCollection('hero');
                } catch (\Exception $e) {
                    Log::error('Attachment processing failed', [
                        'error' => $e->getMessage(),
                        'url' => $attachment->url,
                    ]);
                }
            });
        });
    }

    protected function syncRelatedData(object $data): void
    {
        $this->syncLinks($data->fieldSections);
        $this->syncTags($data->fieldSections);
        $this->saveProposalSilently();
    }

    protected function syncLinks(array $sections): void
    {
        $links = collect($sections)
            ->filter(fn ($field) => ($field->ideaFieldValues[0]->fieldDisplayType ?? '') === 'HYPERLINK')
            ->flatMap(fn ($field) => collect($field->ideaFieldValues)->pluck('value'))
            ->filter();

        $linkIds = $links->map(fn ($url) => Link::updateOrCreate(['link' => $url], [
            'status' => 'published',
            'label' => 'link',
            'title' => 'Relevant Link',
            'valid' => true,
        ])->id);

        $this->proposal->links()->sync($linkIds);
    }

    protected function syncTags(array $sections): void
    {
        $themeField = collect($sections)
            ->firstWhere('title', '[METADATA] Themes:');

        if ($themeField?->ideaFieldValues[0]?->value) {
            $tags = Tag::syncTags(explode(', ', $themeField->ideaFieldValues[0]->value));
            $this->proposal->tags()->sync($tags);
        }
    }

    protected function saveProposalSilently(): void
    {
        Proposal::withoutSyncingToSearch(fn () => $this->proposal->save());
    }
}
