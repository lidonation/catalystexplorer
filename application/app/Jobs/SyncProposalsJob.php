<?php

namespace App\Jobs;

use App\Models\Campaign;
use App\Models\CatalystProfile;
use App\Models\Meta;
use App\Models\Proposal;
use App\Models\Tag;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use JetBrains\PhpStorm\NoReturn;
use League\HTMLToMarkdown\HtmlConverter;

class SyncProposalsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    private string $proposalId;

    /**
     * Create a new job instance.
     */
    public function __construct(public $proposalDetail, public string $fund)
    {
        $this->proposalDetail = toFluentDeep($proposalDetail);
    }

    /**
     * Execute the job.
     */
    #[NoReturn]
    public function handle(): void
    {
        $connection = DB::connection('pgsql');

        $proposalSummary = $this->proposalDetail->payload->summary;

        $categoryUuid = $this->proposalDetail->protected_headers->category_id[0];

        $campaignMeta = Meta::where([
            'model_type' => Campaign::class,
            'key' => 'catalyst_id',
            'content' => $categoryUuid,

        ])->latest()->first();

        $content = $this->processContent(
            $this->proposalDetail->payload->details,
            $this->proposalDetail->payload->campaign_category->category_questions
        );

        $title = ['en' => $this->proposalDetail->payload->setup->title->title];
        $slug = Str::limit(
            Str::slug($this->proposalDetail->payload->setup->title->title), 150, ''
        );

        //  $proposal->slug = Str::limit(Str::slug($proposal->title), 150, '').'-'.'f'.$fundNumber;

        // Search for existing proposal
        $existing = Proposal::where('slug', '=', "{$slug}-f14")
            ->first();

        $data = [
            'id' => Str::uuid7(),
            'title' => json_encode($title),
            'problem' => json_encode(['en' => $proposalSummary->problem->statement]),
            'solution' => json_encode(['en' => $proposalSummary->solution->summary]),
            'content' => json_encode(['en' => $content]),
            'amount_requested' => $proposalSummary->budget->requestedFunds,
            'fund_id' => $this->fund,
            'campaign_id' => $campaignMeta->model_id,
            'slug' => "{$slug}-f14",
            'status' => 'pending',
            'funding_status' => 'pending',
            'updated_at' => now(),
            'type' => 'proposal',
        ];

        if ($existing) {
            $connection->table('proposals')
                ->where('id', $existing->id)
                ->update($data);

            $this->proposalId = $existing->id;
        } else {
            $data['created_at'] = now();

            $this->proposalId = $connection->table('proposals')
                ->insertGetId($data);
        }

        // Metas
        $this->processMetas(
            $proposalSummary->time->duration,
            $this->proposalDetail->payload->setup->proposer->type,
            $proposalSummary->open_source->isOpenSource
        );

        $this->processPrimaryAuthor($this->proposalDetail->payload->setup->proposer);

        $this->processTags($this->proposalDetail->payload->theme->theme->grouped_tag);
        Proposal::find($this->proposalId)?->searchable();
    }

    protected function processContent($content, $category_questions)
    {
        $converter = new HtmlConverter;
        $flatContent = collect($content)->mapWithKeys(function ($section) {
            $key = collect($section->toArray())->keys()->first();
            $value = $section->{$key};

            return [$key => $value];
        });

        $flatCategoryQuestions = collect($category_questions)->mapWithKeys(function ($value, $key) {
            return [$key => $value];
        });

        $merged = $flatContent->merge($flatCategoryQuestions);

        return $merged->map(function ($value, $key) use ($converter) {
            $html = '<h3 class="mt-6">['.Str::headline($key).']</h3>'
                .nl2br(trim($value)).'<br /><br />';

            return $converter->convert($html);
        })->implode("\n\n");
    }

    protected function processTags($groupTags): void
    {
        $tagIds = collect($groupTags)->map(function ($tag) {
            $slug = Str::slug($tag);

            Tag::updateOrInsert(
                ['slug' => $slug],
                [
                    'title' => ucfirst($tag),
                    'meta_title' => ucfirst($tag),
                ]
            );

            // Fetch tag ID
            return Tag::where('slug', $slug)
                ->value('id');
        })->filter();

        foreach ($tagIds as $tagId) {
            DB::connection('pgsql')->table('model_tag')->updateOrInsert(
                [
                    'model_id' => $this->proposalId,
                    'tag_id' => $tagId,
                    'model_type' => Proposal::class,
                ],
            );
        }
    }

    protected function processMetas($project_length, $applicant_type, $opensource): void
    {
        $modelType = Proposal::class;

        $metaItems = [
            ['key' => 'project_length', 'content' => $project_length],
            ['key' => 'applicant_type', 'content' => $applicant_type],
            ['key' => 'opensource', 'content' => $opensource],
        ];

        foreach ($metaItems as $meta) {
            Meta::updateOrInsert(
                [
                    'model_id' => $this->proposalId,
                    'key' => $meta['key'],
                    'model_type' => $modelType,
                ],
                [
                    'content' => $meta['content'],
                ]
            );
        }
    }

    protected function processPrimaryAuthor($data): void
    {
        CatalystProfile::updateOrCreate(
            [
                'name' => $data->applicant,
            ],
            [
                'username' => Str::slug($data->applicant),
                'name' => $data->applicant,
            ]
        );

        $profile = CatalystProfile::where('name', $data->applicant)
            ->first();

        $profile->proposals()->sync([
            $this->proposalId => [
                'profile_type' => CatalystProfile::class,
            ],
        ]);
    }
}
